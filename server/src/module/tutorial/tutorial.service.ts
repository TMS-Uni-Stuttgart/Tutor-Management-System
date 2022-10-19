import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { DateTime, Interval } from 'luxon';
import { Role } from 'shared/model/Role';
import { ITutorial } from 'shared/model/Tutorial';
import { Student } from '../../database/entities/student.entity';
import { Substitute } from '../../database/entities/substitute.entity';
import { Tutorial } from '../../database/entities/tutorial.entity';
import { User } from '../../database/entities/user.entity';
import { CRUDService } from '../../helpers/CRUDService';
import { StudentService } from '../student/student.service';
import { UserService } from '../user/user.service';
import {
    ExcludedTutorialDate,
    SubstituteDTO,
    TutorialDTO,
    TutorialGenerationDTO,
} from './tutorial.dto';

@Injectable()
export class TutorialService implements CRUDService<ITutorial, TutorialDTO, Tutorial> {
    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        @Inject(forwardRef(() => StudentService))
        private readonly studentService: StudentService,
        private readonly entityManager: EntityManager,
        @InjectRepository(Tutorial)
        private readonly repository: EntityRepository<Tutorial>
    ) {}

    /**
     * @returns All tutorials saved in the database.
     */
    async findAll(): Promise<Tutorial[]> {
        return this.repository.findAll({ populate: true });
    }

    /**
     *
     * @param ids IDs of the tutorials to get.
     * @returns Tutorials with the given IDs.
     *
     * @throws {@link NotFoundException} - If at least one of the tutorials could not be found.
     */
    async findMultiple(ids: string[]): Promise<Tutorial[]> {
        const tutorials = await this.repository.find({ id: { $in: ids } }, { populate: true });

        if (tutorials.length !== ids.length) {
            const tutorialIds = tutorials.map((tutorial) => tutorial.id);
            const notFound = ids.filter((id) => !tutorialIds.includes(id));
            throw new NotFoundException(
                `Could not find the tutorials with the following ids: [${notFound.join(', ')}]`
            );
        }

        return tutorials;
    }

    /**
     * Searches for a tutorial with the given ID and returns it.
     *
     * @param id ID to search for.
     *
     * @returns TutorialDocument with the given ID.
     *
     * @throws `NotFoundException` - If no tutorial with the given ID could be found.
     */
    async findById(id: string): Promise<Tutorial> {
        const tutorial = await this.repository.findOne({ id }, { populate: true });

        if (!tutorial) {
            throw new NotFoundException(`Tutorial with the ID ${id} could not be found.`);
        }

        return tutorial;
    }

    /**
     * Creates a new tutorial based on the given information.
     *
     * @param dto Information about the tutorial to create.
     *
     * @throws `NotFoundException` - If the tutor or any of the correctors could not be found.
     * @throws `BadRequestException` - If the tutor to be assigned does not have the TUTOR role or if any of the correctors to be assigned does not have the CORRECTOR role.
     *
     * @returns Created tutorial.
     */
    async create(dto: TutorialDTO): Promise<ITutorial> {
        await this.assertTutorialSlot(dto.slot);

        const { slot, tutorId, correctorIds, startTime, endTime, dates } = dto;
        const [tutor, correctors] = await Promise.all([
            tutorId ? this.userService.findById(tutorId) : undefined,
            Promise.all(correctorIds.map((id) => this.userService.findById(id))),
        ]);

        const created = await this.createTutorial({
            slot,
            tutor,
            correctors,
            startTime: DateTime.fromISO(startTime),
            endTime: DateTime.fromISO(endTime),
            dates: dates.map((date) => DateTime.fromISO(date)),
        });

        return created.toDTO();
    }

    /**
     * Updates the tutorial with the given information and returns the updated tutorial.
     *
     * @param id ID of the Tutorial to update.
     * @param dto Information to update the tutorial with.
     *
     * @returns Updated document.
     *
     * @throws `BadRequestException` - If the tutor to be assigned does not have the TUTOR role or if any of the correctors to be assigned does not have the CORRECTOR role.
     * @throws `NotFoundException` - If the tutorial with the given ID or if the tutor with the ID in the DTO or if any corrector with the ID in the DTO could NOT be found.
     */
    async update(id: string, dto: TutorialDTO): Promise<ITutorial> {
        const tutorial = await this.findById(id);
        const tutor = !!dto.tutorId ? await this.userService.findById(dto.tutorId) : undefined;
        const correctors = await Promise.all(
            dto.correctorIds.map((corrId) => this.userService.findById(corrId))
        );

        this.assertTutorHasTutorRole(tutor);
        this.assertCorrectorsHaveCorrectorRole(correctors);

        tutorial.slot = dto.slot;
        tutorial.dates = dto.dates.map((date) => DateTime.fromISO(date));
        tutorial.startTime = DateTime.fromISO(dto.startTime);
        tutorial.endTime = DateTime.fromISO(dto.endTime);

        tutorial.tutor = tutor;
        tutorial.correctors.set(correctors);

        await this.repository.persistAndFlush(tutorial);
        return tutorial.toDTO();
    }

    /**
     * Deletes the given tutorial and returns it's document.
     *
     * However, a tutorial which still has one or more students assigned to it can _not_ be deleted.
     *
     * @param id ID of the tutorial to delete.
     *
     * @returns Document of the deleted tutorial.
     *
     * @throws `NotFoundException` - If no tutorial with the given ID could be found.
     * @throws `BadRequestException` - If the tutorial to delete still has one or more student assigned to it.
     */
    async delete(id: string): Promise<void> {
        const tutorial = await this.findById(id);

        if (tutorial.studentCount > 0) {
            throw new BadRequestException(`A tutorial with students can NOT be deleted.`);
        }

        this.entityManager.remove(tutorial.teams.getItems());
        this.entityManager.remove(tutorial.substitutes.getItems())

        await this.repository.removeAndFlush(tutorial);
    }

    /**
     * Sets the substitute for the given dates to the given tutor.
     *
     * @see setTutorialSubstitute
     */
    async setSubstitute(id: string, dto: SubstituteDTO): Promise<void> {
        const tutorial = await this.findById(id);
        await this.setTutorialSubstitutes(tutorial, [dto]);
    }

    /**
     * Sets the substitutes of a tutorial according to the given DTOs.
     *
     * Every DTO in the given array will be handled separately.
     *
     * @see setTutorialSubstitute
     */
    async setMultipleSubstitutes(id: string, dtos: SubstituteDTO[]): Promise<void> {
        const tutorial = await this.findById(id);

        await this.setTutorialSubstitutes(tutorial, dtos);
    }

    /**
     * Sets the substitutes according to the given data.
     *
     * If the DTO does not contain a `tutorId` field (ie it is `undefined`) the substitutes of the given dates will be removed. If there is already a substitute for a given date in the DTO the previous substitute gets overridden.
     *
     * @param tutorial Tutorial to set the substitute for.
     * @param dtos DTOs containing the information of the substitutes.
     *
     * @throws `BadRequestException` - If the tutorial of the given `id` parameter could not be found.
     * @throws `BadRequestException` - If the `tutorId` field contains a user ID which can not be found or which does not belong to a tutor.
     */
    private async setTutorialSubstitutes(tutorial: Tutorial, dtos: SubstituteDTO[]): Promise<void> {
        await Promise.all(
            dtos.map(async (dto) => {
                const dates = dto.dates.map((date) => DateTime.fromISO(date));
                if (!dto.tutorId) {
                    await this.removeSubstituteForDates({
                        tutorial: tutorial,
                        dates: dates,
                    });
                } else {
                    await this.addSubstituteForDates({
                        tutorId: dto.tutorId,
                        tutorial: tutorial,
                        dates: dates,
                    });
                }
            })
        );
        await this.entityManager.flush();
    }

    /**
     * Adds the tutor with the given id as substitute of the tutorial to the given dates.
     * If a substitute for the given tutial and date
     *
     * The updates are persisted in the {@link entityManager} but not flushed or committed. Therefore they must be committed manually.
     *
     * @param tutorId ID of the substitute tutor.
     * @param tutorial Tutorial to substitute.
     * @param dates Dates to substitute.
     *
     * @throws {@link NotFoundException} - If no tutor with the given `tutorId` could be found.
     * @private
     */
    private async addSubstituteForDates({
        tutorId,
        tutorial,
        dates,
    }: AddSubstituteForDatesParams): Promise<void> {
        const tutor = await this.userService.findById(tutorId);
        this.assertTutorHasTutorRole(tutor);

        const existingSubstitutes = await this.getSubstitutesForDates(tutorial, dates);
        dates.forEach((date) => {
            const existingSubstitute = existingSubstitutes.find(
                (substitute) => +substitute.date === +date
            );
            if (existingSubstitute) {
                existingSubstitute.substituteTutor = tutor;
                this.entityManager.persist(existingSubstitute);
            } else {
                this.entityManager.persist(
                    new Substitute({
                        tutorialToSubstitute: tutorial,
                        substituteTutor: tutor,
                        date,
                    })
                );
            }
        });
    }

    /**
     * Removes all substitute from the tutorial at the given dates.
     *
     * The changes are persisted in the {@link entityManager} but not flushed or committed. Therefore they must be committed manually.
     *
     * @param tutorial Tutorial to remove the substitutes.
     * @param dates Dates to remove the substitutes.
     * @private
     */
    private async removeSubstituteForDates({
        tutorial,
        dates,
    }: RemoveSubstituteForDatesParams): Promise<void> {
        const substituteForGivenDates = await this.getSubstitutesForDates(tutorial, dates);
        this.entityManager.remove(substituteForGivenDates);
    }

    /**
     * Gets substitutes for a tutorial and the given dates
     *
     * @param tutorial Tutorial substitutes must be associated with.
     * @param dates Dates substitutes must take place at.
     * @returns the found substitutes
     */
    private async getSubstitutesForDates(
        tutorial: Tutorial,
        dates: DateTime[]
    ): Promise<Substitute[]> {
        return this.entityManager.find(Substitute, {
            tutorialToSubstitute: tutorial,
            date: { $in: dates },
        });
    }

    /**
     * Returns all students in the tutorial with the given ID.
     *
     * @param id ID of the tutorial to get the students of.
     *
     * @returns All students in the tutorial with the given ID.
     *
     * @throws `NotFoundException` - If no tutorial with the given ID could be found.
     */
    async getAllStudentsOfTutorial(id: string): Promise<Student[]> {
        const tutorial = await this.findById(id);
        return tutorial.getStudents();
    }

    /**
     * Creates multiple tutorials with the given information.
     *
     * The created tutorials will **not** have any correctors or a tutor assigned but will have all dates specified in the DTO.
     *
     * @param dto DTO with the information of the tutorials to generate.
     *
     * @returns Array containing the response DTOs of the created tutorials.
     */
    async createMany(dto: TutorialGenerationDTO): Promise<ITutorial[]> {
        const { excludedDates, generationDatas } = dto;
        const createdTutorials: Tutorial[] = [];
        const interval = Interval.fromDateTimes(dto.getFirstDay(), dto.getLastDay());
        const daysInInterval = this.datesInIntervalGroupedByWeekday(interval);
        const indexForWeekday: { [key: string]: number } = {};

        for (const data of generationDatas) {
            const { amount, prefix, weekday } = data;
            const days = daysInInterval.get(weekday) ?? [];
            const dates = this.removeExcludedDates(days, excludedDates);
            const timeInterval = data.getInterval();

            if (dates.length > 0) {
                for (let i = 0; i < amount; i++) {
                    const nr = (indexForWeekday[weekday] ?? 0) + 1;
                    const created = await this.createTutorial({
                        slot: `${prefix}${nr.toString().padStart(2, '0')}`,
                        dates,
                        startTime: timeInterval.start,
                        endTime: timeInterval.end,
                        tutor: undefined,
                        correctors: [],
                    });

                    indexForWeekday[weekday] = nr;
                    createdTutorials.push(created);
                }
            }
        }

        return createdTutorials.map((t) => t.toDTO());
    }

    /**
     * Creates a new tutorial and adds it to the database.
     *
     * This function first checks if the given `tutor` and `correctors` are all valid. Afterwards a new TutorialDocument is created and saved in the database. This document is returned in the end.
     *
     * @param params Parameters needed to create a tutorial.
     *
     * @returns Document of the created tutorial.
     *
     * @throws `BadRequestException` - If the given `tutor` is not a TUTOR or one of the given `correctors` is not a CORRECTOR.
     */
    private async createTutorial({
        slot,
        tutor,
        startTime,
        endTime,
        dates,
        correctors,
    }: CreateParameters): Promise<Tutorial> {
        this.assertTutorHasTutorRole(tutor);
        this.assertCorrectorsHaveCorrectorRole(correctors);
        this.assertAtLeastOneDate(dates);

        const tutorial = new Tutorial({ slot, dates, startTime, endTime });
        tutorial.tutor = tutor;
        tutorial.correctors.set(correctors);
        await this.repository.persistAndFlush(tutorial);

        return tutorial;
    }

    /**
     * Returns all dates in the interval grouped by their weekday.
     *
     * Groups all dates in the interval by their weekday (1 - monday, 7 - sunday) and returns a map with those weekdays as keys. The map only contains weekdays as keys which are present in the interval (ie if only a monday and a tuesday are in the interval the map will only contain the keys `1` and `2`).
     *
     * @param interval Interval to get dates from.
     *
     * @returns Map with weekdays as keys and all dates from the interval on the corresponding weekday. Note: Not all weekdays may be present in the returned map.
     */
    private datesInIntervalGroupedByWeekday(interval: Interval): Map<number, DateTime[]> {
        const datesInInterval: Map<number, DateTime[]> = new Map();
        let cursor = interval.start.startOf('day');

        while (cursor <= interval.end) {
            const dates = datesInInterval.get(cursor.weekday) ?? [];

            dates.push(cursor);
            datesInInterval.set(cursor.weekday, dates);

            cursor = cursor.plus({ day: 1 });
        }

        return datesInInterval;
    }

    /**
     * Creates a copy of the `dates` array without the excluded dates.
     *
     * The `dates` array itself will **not** be changed but copied in the process.
     *
     * @param dates Dates to remove the excludedDates from.
     * @param excludedDates Information about the dates which should be excluded.
     *
     * @returns A copy of the `dates` array but without the excluded dates.
     */
    private removeExcludedDates(
        dates: DateTime[],
        excludedDates: ExcludedTutorialDate[]
    ): DateTime[] {
        const dateArray = [...dates];

        for (const excluded of excludedDates) {
            for (const excludedDate of excluded.getDates()) {
                const idx = dateArray.findIndex((date) => date.hasSame(excludedDate, 'day'));

                if (idx !== -1) {
                    dateArray.splice(idx, 1);
                }
            }
        }

        return dateArray;
    }

    private assertTutorHasTutorRole(tutor?: User) {
        if (tutor && !tutor.roles.includes(Role.TUTOR)) {
            throw new BadRequestException('The tutor of a tutorial needs to have the TUTOR role.');
        }
    }

    private assertCorrectorsHaveCorrectorRole(correctors: User[]) {
        for (const doc of correctors) {
            if (!doc.roles.includes(Role.CORRECTOR)) {
                throw new BadRequestException(
                    'The corrector of a tutorial needs to have the CORRECTOR role.'
                );
            }
        }
    }

    private async assertTutorialSlot(slot: string) {
        const tutorialWithSameSlot = await this.repository.findOne({ slot });

        if (!!tutorialWithSameSlot) {
            throw new BadRequestException(`A tutorial with the slot '${slot} already exists.`);
        }
    }

    private assertAtLeastOneDate(dates: DateTime[]) {
        if (dates.length === 0) {
            throw new BadRequestException(
                `A tutorial without dates should be generated. This is not allowed.`
            );
        }
    }
}

interface CreateParameters {
    slot: string;
    tutor: User | undefined;
    startTime: DateTime;
    endTime: DateTime;
    dates: DateTime[];
    correctors: User[];
}

interface AddSubstituteForDatesParams {
    tutorId: string;
    tutorial: Tutorial;
    dates: DateTime[];
}

interface RemoveSubstituteForDatesParams {
    tutorial: Tutorial;
    dates: DateTime[];
}
