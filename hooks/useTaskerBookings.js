import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { subscribeTaskerBookings, acceptBooking, declineBooking, startJob, completeJob } from '../services/bookings.service';

export const useTaskerBookings = () => {
  const { user }                = useAuth();
  const [pending,   setPending]   = useState([]);
  const [confirmed, setConfirmed] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeTaskerBookings(user.uid, ({ pending, confirmed, completed }) => {
      setPending(pending); setConfirmed(confirmed); setCompleted(completed); setLoading(false);
    });
  }, [user?.uid]);

  return { pending, confirmed, completed, loading, acceptBooking, declineBooking, startJob, completeJob };
};

export const useTaskerStats = () => {
  const { user }        = useAuth();
  const [stats, setStats] = useState({ todayEarnings: 0, weekEarnings: 0, monthEarnings: 0, totalJobs: 0 });

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db,'bookings'), where('taskerId','==',user.uid), where('status','==','completed'));
    return onSnapshot(q, (snap) => {
      const jobs = snap.docs.map(d => d.data());
      const now  = new Date();
      const sod  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sow  = new Date(now); sow.setDate(now.getDate() - now.getDay()); sow.setHours(0, 0, 0, 0);
      const som  = new Date(now.getFullYear(), now.getMonth(), 1);
      const sum  = (arr) => arr.reduce((t,j) => t + (j.pricing?.total ?? 0), 0);
      const after = (d) => jobs.filter(j => j.completedAt?.toDate?.() >= d);
      setStats({ todayEarnings: sum(after(sod)), weekEarnings: sum(after(sow)), monthEarnings: sum(after(som)), totalJobs: jobs.length });
    });
  }, [user?.uid]);

  return stats;
};
