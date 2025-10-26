
import { Request } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { fileUploader } from "../../helper/fileUploader";




const createPatient = async (req: Request) => {
    
    if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file)
        // console.log("upload file", uploadResult)
         req.body.patient.profilePhoto = uploadResult?.secure_url
    }

     const hashPassword = await bcrypt.hash(req.body.password, 10);

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: req.body.patient.email,
                password: hashPassword
            }
        });

        return await tnx.patient.create({
            data: req.body.patient
        })
     })

      return result;
}

export const UserService = {
    createPatient
}