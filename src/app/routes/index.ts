import express from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { ScheduleRoutes } from '../modules/Schedule/schedule.routes';
import { DoctorScheduleRoutes } from '../modules/DoctorSchedule/doctorSchedule.routes';
import { SpecialtiesRoutes } from '../modules/specialties/specialties.routes';
import { DoctorRoutes } from '../modules/doctor/doctor.routes';
import { AppointmentRoutes } from '../modules/Appointment/appointment.routes';
import { PaymentRoutes } from '../modules/Payment/payment.routes';


const router = express.Router();

const moduleRoutes = [

    {
        path: "/user",
        route: userRoutes,
    },
    {
        path: '/auth',
        route: authRoutes,
    },
    {
        path: '/schedule',
        route: ScheduleRoutes,
    },
    {
        path: '/doctor-schedule',
        route: DoctorScheduleRoutes,
    },
    {
        path: '/specialties',
        route: SpecialtiesRoutes,
    },
    {
        path: '/doctor',
        route: DoctorRoutes,
    },
    {
        path: '/appointment',
        route: AppointmentRoutes,
    },
    {
        path: '/payment',
        route: PaymentRoutes,
    },
    
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;