import { z } from 'zod';

const create = z.object({
    body: z.object({
        email: z.string({
            error: 'Email is required',
        }),
        name: z.string({
            error: 'Name is required',
        }),
        profilePhoto: z.string({
            error: 'Profile Photo is required',
        }),
        contactNumber: z.string({
            error: 'Contact Number is required',
        }),
        registrationNumber: z.string({
            error: 'Registration Number is required',
        }),
        experience: z.number({
            error: 'Experience is required',
        }),
        gender: z.string({
            error: 'Gender is required',
        }),
        apointmentFee: z.number({
            error: 'Blood group is required',
        }),
        qualification: z.string({
            error: 'Apointment Fee is required',
        }),
        currentWorkingPlace: z.string({
            error: 'Current Working Place is required',
        }),
        designation: z.string({
            error: 'Designation is required',
        }),
    }),
});

const update = z.object({
    body: z.object({
        name: z.string().optional(),
        profilePhoto: z.string().optional(),
        contactNumber: z.string().optional(),
        registrationNumber: z.string().optional(),
        experience: z.number().optional(),
        gender: z.string().optional(),
        apointmentFee: z.number().optional(),
        qualification: z.string().optional(),
        currentWorkingPlace: z.string().optional(),
        designation: z.string().optional(),
    }),
});

export const DoctorValidation = {
    create,
    update,
};