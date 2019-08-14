package de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.persistence.Entity;
import javax.persistence.Transient;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.IsScheinCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.formgenerator.annotations.ScheinCriteriaPercentage;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.BeanService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinExamService;
import lombok.AccessLevel;
import lombok.Getter;

/**
 * ScheinExamCriteria
 */
@Getter
@Entity
@IsScheinCriteria(identifier = "exam")
public class ScheinExamCriteria extends ScheinCriteria {

    private boolean passAllExamsIndividually;

    @ScheinCriteriaPercentage
    private double percentageOfAllPointsNeeded;

    @Transient
    @Getter(value = AccessLevel.NONE)
    private ScheinExamService scheinExamService = BeanService.getBean(ScheinExamService.class);

    @Override
    public boolean isPassed(final Student student) {
        int examsPassed = 0;
        double pointsAchieved = 0d;
        double pointsTotal = 0;

        final var allExams = scheinExamService.getAllScheinExams();

        for (var exam : allExams) {
            double result = student.getScheinExamResult(exam);
            double maxPoints = exam.calculateTotalPoints();

            pointsAchieved += result;
            pointsTotal += maxPoints;

            if (Double.compare(result / maxPoints, exam.getPercentageNeeded()) >= 0) {
                examsPassed++;
            }
        }

        if (isPassAllExamsIndividually()) {
            return examsPassed >= allExams.size();
        } else {
            return Double.compare(pointsAchieved / pointsTotal, percentageOfAllPointsNeeded) >= 0;
        }
    }

    @Override
    public ScheinCriteriaStatusResponseDTO getStatusDTO(Student student) {

        Map<UUID, ScheinCriteriaAdditionalStatusResponseDTO> infos = new HashMap<>();
        double achieved = 0d;
        var exams = scheinExamService.getAllScheinExams();

        for (var exam : exams) {
            double result = student.getScheinExamResult(exam);
            double maxPoints = exam.calculateTotalPoints();
            PassedState state;

            if (Double.compare(result / maxPoints, exam.getPercentageNeeded()) >= 0) {
                state = PassedState.PASSED;
                achieved += 1d;
            } else {
                state = PassedState.NOTPASSED;
            }

            infos.put(exam.getId(), new ScheinCriteriaAdditionalStatusResponseDTO(result, maxPoints,
                    exam.getScheinExamNo(), ScheinCriteriaUnit.POINT, state));


        }

        return new ScheinCriteriaStatusResponseDTO(this.getId(), this.getIdentifier(),
                this.getName(), achieved, exams.size(), ScheinCriteriaUnit.EXAM,
                this.isPassed(student), infos);
    }
}
