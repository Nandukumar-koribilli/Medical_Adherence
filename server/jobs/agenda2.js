let agenda;

export async function initAgenda(mongoUri) {
  if (agenda) return agenda;

  let Agenda;
  try {
    Agenda = (await import('agenda')).default;
  } catch (e) {
    console.error('Agenda package missing:', e?.message || e);
    return null; // Caller should handle null
  }

  agenda = new Agenda({ db: { address: mongoUri, collection: 'agendaJobs' } });

  // Compute next occurrence for a given reminder (supports weekly, daily, everyX)
  function computeNextForReminder(rem, fromDate = new Date()) {
    if (!rem) return null;
    const nameToNum = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    if (!rem.isRecurring) return null;

    const timeStr = rem.time || '00:00';
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10) || 0;
    const minute = parseInt(minuteStr, 10) || 0;

    if (rem.recurrenceType === 'daily') {
      for (let i = 0; i < 365; i++) {
        const cand = new Date(fromDate);
        cand.setDate(fromDate.getDate() + i);
        cand.setHours(hour, minute, 0, 0);
        if (cand >= fromDate) return cand;
      }
      return null;
    }

    if (rem.recurrenceType === 'everyX' && rem.everyXDays && rem.everyXDays > 0) {
      const anchor = rem.lastRun ? new Date(rem.lastRun) : (rem.createdAt ? new Date(rem.createdAt) : new Date());
      let candidate = new Date(anchor);
      candidate.setHours(hour, minute, 0, 0);
      while (candidate <= fromDate) {
        candidate.setDate(candidate.getDate() + rem.everyXDays);
      }
      return candidate;
    }

    const days = rem.daysOfWeek || [];
    const daysNums = days.map(d => nameToNum[d]).filter(d => typeof d === 'number');
    if (daysNums.length === 0) return null;

    for (let i = 0; i < 14; i++) {
      const candidate = new Date(fromDate);
      candidate.setDate(fromDate.getDate() + i);
      candidate.setHours(hour, minute, 0, 0);
      if (candidate >= fromDate && daysNums.includes(candidate.getDay())) return candidate;
    }
    return null;
  }

  // Define job
  agenda.define('process reminder', { concurrency: 5 }, async (job) => {
    const reminderId = job.attrs?.data?.reminderId;
    if (!reminderId) return;

    try {
      const Reminder = (await import('../models/Reminder.js')).default;
      const Message = (await import('../models/Message.js')).default;
      const Notification = (await import('../models/Notification.js')).default;

      const rem = await Reminder.findById(reminderId);
      if (!rem) return;

      if (!rem.isRecurring && rem.sent) return;

      await Message.create({ senderId: rem.userId, receiverId: rem.userId, content: rem.message || `Reminder: take ${rem.medicineName}` });
      await Notification.create({ userId: rem.userId, title: 'Medication Reminder', message: rem.message || `Time to take ${rem.medicineName}` });

      if (rem.isRecurring) {
        rem.lastRun = new Date();
        await rem.save();
        try {
          const next = computeNextForReminder(rem, new Date(Date.now() + 1000));
          if (next) {
            await agenda.cancel({ 'data.reminderId': rem._id });
            await agenda.create('process reminder', { reminderId: rem._id }).unique({ 'data.reminderId': rem._id }).schedule(next).save();
          }
        } catch (err) {
          console.error('Failed to schedule next occurrence', err?.message || err);
        }
      } else {
        rem.sent = true;
        await rem.save();
      }
    } catch (err) {
      console.error('process reminder job error', err?.message || err);
      throw err;
    }
  });

  agenda.computeNextOccurrence = computeNextForReminder;

  await agenda.start();
  console.log('Agenda started and job processor initialized');
  return agenda;
}

export function getAgenda() {
  if (!agenda) throw new Error('Agenda not initialized');
  return agenda;
}
