import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller';
import { fileUploader } from '../../helper/fileUploader';
import { UserValidation } from './user.validation';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';


const router = express.Router();

router.get(
    "/",
    auth(UserRole.ADMIN),
    UserController.getAllFromDB
)


router.get(
    '/me',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    UserController.getMyProfile
)

router.post(
    "/create-patient", 
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createPatient.parse(JSON.parse(req.body.data))
        return UserController.createPatient(req, res, next)
    }
)

router.post(
    "/create-admin",
    auth(UserRole.ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createAdmin.parse(JSON.parse(req.body.data))
        return UserController.createAdmin(req, res, next)
    }
);

router.post(
    "/create-doctor",
    auth(UserRole.ADMIN),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        console.log(JSON.parse(req.body.data))
        req.body = UserValidation.createDoctor.parse(JSON.parse(req.body.data))
        return UserController.createDoctor(req, res, next)
    }
);

router.patch(
    '/:id/status',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    validateRequest(UserValidation.updateStatus),
    UserController.changeProfileStatus
);

router.patch(
    "/update-my-profile",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data)
        return UserController.updateMyProfie(req, res, next)
    }
);



export const userRoutes = router;

// john.doe@gmail.com, doctor
// mejan@gmail.com, Admin
// ahsankrum@gmail.com, pa