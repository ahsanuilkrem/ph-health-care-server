import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";
import { IDoctorUpdate } from "./doctor.interface";
import { askOpenRouter } from "../../helper/openRouterClient";



const getAllFromDB = async (filters: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    // "", "medicine"
    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialities: {
                        title: {
                            contains: specialties,
                            mode: "insensitive"
                        }
                    }
                }
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))

        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.DoctorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }
    });

    const total = await prisma.doctor.count({
        where: whereConditions
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}

// const getAllFromDB = async (
//   filters: IDoctorScheduleFilterRequest,
//   options: IPaginationOptions
// ) => {
//   const { limit, page, skip } = paginationHelper.calculatePagination(options);
//   const { searchTerm, Specialties, ...filterData } = filters;

//   const andConditions: Prisma.DoctorWhereInput[] = [];

//   if (searchTerm) {
//     andConditions.push({
//       OR: doctorSearchableFields.map((field) => ({
//         [field]: {
//           contains: searchTerm,
//           mode: "insensitive",
//         },
//       })),
//     });
//   }

//   // doctor > doctorSpecialties > specialties -> title

//   if (specialties && specialties.length > 0) {
//     andConditions.push({
//       doctorSpecialties: {
//         some: {
//           specialities: {
//             title: {
//               contains: specialties,
//               mode: "insensitive",
//             },
//           },
//         },
//       },
//     });
//   }

//   if (Object.keys(filterData).length > 0) {
//     const filterConditions = Object.keys(filterData).map((key) => ({
//       [key]: {
//         equals: (filterData as any)[key],
//       },
//     }));
//     andConditions.push(...filterConditions);
//   }

//   andConditions.push({
//     isDeleted: false,
//   });

//   const whereConditions: Prisma.DoctorWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.doctor.findMany({
//     where: whereConditions,
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? { [options.sortBy]: options.sortOrder }
//         : { averageRating: "desc" },
//     include: {
//       doctorSpecialties: {
//         include: {
//           specialities: true,
//         },
//       },
//       review: {
//         select: {
//           rating: true,
//         },
//       },
//     },
//   });

//   const total = await prisma.doctor.count({
//     where: whereConditions,
//   });

//   return {
//     meta: {
//       total,
//       page,
//       limit,
//     },
//     data: result,
//   };
// };

const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true
        }

      },
       review: true,
    },
  });
  return result;
};

const updateIntoDB = async (id: string, payload: IDoctorUpdate) => {
  const { specialties, ...doctorData } = payload;

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
    });

    if (specialties && specialties.length > 0) {
      // delete specialties
      const deleteSpecialtiesIds = specialties.filter(
        (specialty) => specialty.isDeleted
      );
      //console.log(deleteSpecialtiesIds)
      for (const specialty of deleteSpecialtiesIds) {
        await transactionClient.doctorSpecialties.deleteMany({
          where: {
            doctorId: doctorInfo.id,
            specialitiesId: specialty.specialtiesId,
          },
        });
      }

      // create specialties
      const createSpecialtiesIds = specialties.filter(
        (specialty) => !specialty.isDeleted
      );
      console.log(createSpecialtiesIds);
      for (const specialty of createSpecialtiesIds) {
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: doctorInfo.id,
            specialitiesId: specialty.specialtiesId,
          },
        });
      }
    }
  });

  const result = await prisma.doctor.findUnique({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
  return result;
};

const deleteFromDB = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.delete({
      where: {
        id,
      },
    });

    await transactionClient.user.delete({
      where: {
        email: deleteDoctor.email,
      },
    });

    return deleteDoctor;
  });
};

const softDelete = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deleteDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deleteDoctor;
  });
};

type PatientInput = {
  symptoms: string;
};

const getAISuggestion = async (input: PatientInput) => {
  const doctors = await prisma.doctor.findMany({
    where: { isDeleted: false },
    include: {
      doctorSpecialties: {
        include: { specialities: true },
      },
    //   review: { select: { rating: true } },
    },
  });

  const systemMessage = {
    role: "system",
    content:
      "You are a medical recommendation assistant. Based on a patient's symptoms and doctor data including specialties and reviews, suggest the top 5 most suitable doctors return the doctors in an array with the whole data object.",
  };

  const userMessage = {
    role: "user",
    content: `
Patient Symptoms: ${input.symptoms}

Here is the list of available doctors (JSON):
${JSON.stringify(doctors)}

Instructions:
1. Analyze patient symptoms.
2. Determine most relevant specialty.
3. Pick top 5 doctors from that specialty or pick the available even if less than 5.
4. If no doctors found, return an empty array or any other doctor.
5. Prioritize based on highest ratings.
6. Return an array of doctor objects ONLY in valid JSON format.
7. Each doctor object must contain these keys: id, name, specialty, experience, averageRating, appointmentFee.

Respond ONLY with the JSON array. No extra text or explanation.
`,
  };

  const response = await askOpenRouter([systemMessage, userMessage]);
  const cleanedJson = response
    .replace(/```(?:json)?\s*/, "") // remove ``` or ```json
    .replace(/```$/, "") // remove ending ```
    .trim();

  const suggestedDoctors = JSON.parse(cleanedJson);
  return suggestedDoctors;
};

export const DoctorService = {
  updateIntoDB,
  getAllFromDB,
  getByIdFromDB,
  deleteFromDB,
  softDelete,
  getAISuggestion,
};




// const updateIntoDB = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
//     const doctorInfo = await prisma.doctor.findUniqueOrThrow({
//         where: {
//             id
//         }
//     });

//     const { specialties, ...doctorData } = payload;

//     return await prisma.$transaction(async (tnx) => {
//         if (specialties && specialties.length > 0) {
//             const deleteSpecialtyIds = specialties.filter((specialty) => specialty.isDeleted);

//             for (const specialty of deleteSpecialtyIds) {
//                 await tnx.doctorSpecialties.deleteMany({
//                     where: {
//                         doctorId: id,
//                         specialitiesId: specialty.specialtyId
//                     }
//                 })
//             }

//             const createSpecialtyIds = specialties.filter((specialty) => !specialty.isDeleted);

//             for (const specialty of createSpecialtyIds) {
//                 await tnx.doctorSpecialties.create({
//                     data: {
//                         doctorId: id,
//                         specialitiesId: specialty.specialtyId
//                     }
//                 })
//             }

//         }

//         const updatedData = await tnx.doctor.update({
//             where: {
//                 id: doctorInfo.id
//             },
//             data: doctorData,
//             include: {
//                 doctorSpecialties: {
//                     include: {
//                         specialities: true
//                     }
//                 }
//             }

//             //  doctor - doctorSpecailties - specialities 
//         })

//         return updatedData
//     })


// }

// export const DoctorService = {
//     getAllFromDB,
//     updateIntoDB
// }