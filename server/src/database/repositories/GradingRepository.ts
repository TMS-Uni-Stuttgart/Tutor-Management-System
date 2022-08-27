import { EntityRepository } from '@mikro-orm/mysql';
import { Grading } from '../entities/grading.entity';

export class GradingRepository extends EntityRepository<Grading> {}
