import { Column, Entity, EntityManager, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { AddWorkingTimeArgs, WorkingTimeCounterRepositoryInterface } from './WorkingTimeCounterRepositoryInterface';
import { WorkingTime as WorkingTimeM } from './entities';

@Entity('working_time')
export class WorkingTime {
  @PrimaryGeneratedColumn({ type: 'int', name: 'working_time_id' })
  workingTimeId: number;

  @Column({ type: 'int' , nullable: false, name: 'hours'})
  hours: number;

  @Column({ type: 'int' , nullable: false , name: 'month'})
  month: number;

  @Column({ type: 'varchar' , nullable: false, name: 'user_uuid'})
  userUuid: string;
}

export class User {
  
}

export class WorkingTimeCounterRepository
  extends Repository<WorkingTime>
  implements WorkingTimeCounterRepositoryInterface
{
  private readonly workingTimeCounterRepo: Repository<WorkingTime>;

  constructor(manager: EntityManager) {
    super(WorkingTime, manager);
    this.workingTimeCounterRepo = manager.getRepository(WorkingTime);
  }

  async addWorkingTime(args: AddWorkingTimeArgs): Promise<void> {
    const entity = new WorkingTime();
    entity.hours = args.hours;
    entity.month = args.months;
    entity.userUuid = args.userUuid;

    await this.workingTimeCounterRepo.save(entity);
  }

  async getWorkingTime(userUuid: string): Promise<WorkingTimeM[]> {
    return this.workingTimeCounterRepo.findBy({
      userUuid,
    });
  }
}
