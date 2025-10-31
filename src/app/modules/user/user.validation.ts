// import { Gender } from "@prisma/client";
// import z from "zod";

// const createPatientValidationSchema = z.object({
//     password: z.string(),
//     patient: z.object({
//         name: z.string().nonempty("Name is required"),
//         email: z.string().nonempty("Email is required"),
//         address: z.string().optional()
//     })
// });

// const createAdminValidationSchema = z.object({
//     password: z.string({
//         error: "Password is required"
//     }),
//     admin: z.object({
//         name: z.string({
//             error: "Name is required!"
//         }),
//         email: z.string({
//             error: "Email is required!"
//         }),
//         contactNumber: z.string({
//             error: "Contact Number is required!"
//         })
//     })
// });

// const createDoctorValidationSchema = z.object({
//     password: z.string({
//         error: "Password is required"
//     }),
//     doctor: z.object({
//         name: z.string({
//             error: "Name is required!"
//         }),
//         email: z.string({
//             error: "Email is required!"
//         }),
//         contactNumber: z.string({
//             error: "Contact Number is required!"
//         }),
//         address: z.string().optional(),
//         registrationNumber: z.string({
//             error: "Reg number is required"
//         }),
//         experience: z.number().optional(),
//         gender: z.enum([Gender.MALE, Gender.FEMALE]),
//         appointmentFee: z.number({
//             error: "appointment fee is required"
//         }),
//         qualification: z.string({
//             error: "quilification is required"
//         }),
//         currentWorkingPlace: z.string({
//             error: "Current working place is required!"
//         }),
//         designation: z.string({
//             error: "Designation is required!"
//         })
//     })
// });

// export const UserValidation = {
//     createPatientValidationSchema,
//     createAdminValidationSchema,
//     createDoctorValidationSchema
// }

import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

const createAdmin = z.object({
    password: z.string({
        error: "Password is required"
    }),
    admin: z.object({
        name: z.string({
            error: "Name is required!"
        }),
        email: z.string({
            error: "Email is required!"
        }),
        contactNumber: z.string({
            error: "Contact Number is required!"
        })
    })
});

const createDoctor = z.object({
    password: z.string({
        error: "Password is required"
    }),
    doctor: z.object({
        name: z.string({
            error: "Name is required!"
        }),
        email: z.string({
            error: "Email is required!"
        }),
        contactNumber: z.string({
            error: "Contact Number is required!"
        }),
        address: z.string().optional(),
        registrationNumber: z.string({
            error: "Reg number is required"
        }),
        experience: z.number().optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE]),
        appointmentFee: z.number({
            error: "appointment fee is required"
        }),
        qualification: z.string({
            error: "quilification is required"
        }),
        currentWorkingPlace: z.string({
            error: "Current working place is required!"
        }),
        designation: z.string({
            error: "Designation is required!"
        })
    })
});

const createPatient = z.object({
    password: z.string(),
    patient: z.object({
        email: z.string({
            error: "Email is required!"
        }).email(),
        name: z.string({
            error: "Name is required!"
        }),
        contactNumber: z.string({
            error: "Contact number is required!"
        }),
        address: z.string({
            error: "Address is required"
        })
    })
});

const updateStatus = z.object({
    body: z.object({
        status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED])
    })
})

export const UserValidation = {
    createAdmin,
    createDoctor,
    createPatient,
    updateStatus
}