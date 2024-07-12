import { WorkingTime } from './entities';

export interface AddWorkingTimeArgs {
  hours: number;
  months: number;
  userUuid: string;
}

export interface WorkingTimeCounterRepositoryInterface {
  addWorkingTime(args: AddWorkingTimeArgs): Promise<void>;
  getWorkingTime(userUuid: string): Promise<WorkingTime[]>;
}
