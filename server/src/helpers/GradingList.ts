import { Grading } from '../database/entities/grading.entity';
import { HandIn } from '../database/entities/ratedEntity.entity';

/**
 * Special list that holds {@link Grading}s.
 */
export class GradingList {
    constructor(private readonly gradings: readonly Grading[]) {}

    /**
     * @param handIn Hand-in to get the grading of.
     *
     * @returns {@link Grading} for the given hand-in. If there is no grading for this hand-in `undefined` is returned instead.
     */
    getGradingOfHandIn(handIn: HandIn): Grading | undefined {
        return this.gradings.find((g) => g.handIn.id === handIn.id);
    }
}

/**
 * Holds the {@link GradingList}s for different students for an easier access.
 */
export class GradingListsForStudents {
    private readonly gradings: Map<string, GradingList> = new Map();

    /**
     * Add a {@link GradingList} for the student with the given ID.
     *
     * If there already is a GradingList for this student the old one gets overridden.
     *
     * @param studentId ID of the student to set the GradingList for.
     * @param list GradingList to set.
     */
    addGradingList(studentId: string, list: GradingList): void {
        this.gradings.set(studentId, list);
    }

    /**
     *
     * @param studentId ID of the student to get the grading for.
     * @param handIn Hand-in to get grading of.
     *
     * @returns {@link Grading} for the given student id and hand-in. If there is none `undefined` is returned instead.
     */
    getGradingForHandIn(studentId: string, handIn: HandIn): Grading | undefined {
        return this.gradings.get(studentId)?.getGradingOfHandIn(handIn);
    }

    /**
     * @param handIn Hand-in to get the gradings of.
     */
    getAllGradingsForHandIn(handIn: HandIn): Grading[] {
        const gradings: Grading[] = [];

        for (const gradingList of this.gradings.values()) {
            const grading = gradingList.getGradingOfHandIn(handIn);

            // TODO: Don't include duplicates!
            if (!!grading) {
                gradings.push(grading);
            }
        }

        return gradings;
    }

    /**
     * Returns the {@link GradingList} of the given studentId in this list.
     *
     * If there is no such GradingList present an empty one is returned.
     *
     * @param studentId ID of the student to get the GradingList of.
     *
     * @returns The {@link GradingList} as described above.
     */
    getGradingListOfStudent(studentId: string): GradingList {
        return this.gradings.get(studentId) || new GradingList([]);
    }
}
