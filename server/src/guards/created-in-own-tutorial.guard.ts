import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { StudentDTO } from '../module/student/student.dto';
import { TutorialService } from '../module/tutorial/tutorial.service';
import { Role } from '../shared/model/Role';
import { UseUserFromRequest } from './helpers/UseUserFromRequest';

/**
 * Guard which checks if the student which should be created with the given DTO is created in one of the tutorials of the user making the request.
 *
 * This guard allows all users with the ADMIN role immediate access.
 */
@Injectable()
export class CreatedInOwnTutorialGuard extends UseUserFromRequest {
  constructor(private readonly tutorialService: TutorialService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = this.getUserFromRequest(context);

    if (user.roles.includes(Role.ADMIN)) {
      return true;
    }

    const body: StudentDTO = context.switchToHttp().getRequest<Request>().body;
    const tutorial = await this.tutorialService.findById(body.tutorial);

    return tutorial.tutor?.id === user._id;
  }
}
