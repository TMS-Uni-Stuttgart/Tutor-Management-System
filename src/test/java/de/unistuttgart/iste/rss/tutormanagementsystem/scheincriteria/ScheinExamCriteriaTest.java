package de.unistuttgart.iste.rss.tutormanagementsystem.scheincriteria;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.ScheinExamCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExam;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExamDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinExamService;

@Transactional
public class ScheinExamCriteriaTest extends TestHelperFunctions {

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    ScheinExamService scheinExamService;

    @Test
    public void testOneScheinExam() throws ElementNotFoundException, IOException {
        List<Student> students = createStudents(5, initTutorial(getDates()));

        ScheinExam scheinExam = scheinExamService.createScheinExam(
                new ScheinExamDTO(1, createExercisesWith10PtsEach(11, 1), Instant.now(), 0.8));

        List<List<Double>> pointsOfStudents = new ArrayList<List<Double>>();

        for (int i = 0; i < students.size(); i++) {
            pointsOfStudents.add(new ArrayList<Double>());
        }

        pointsOfStudents.get(0)
                .addAll(Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d, 10d, 10d, 10d, 10d)); // pass

        pointsOfStudents.get(1)
                .addAll(Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d, 10d, 0d, 0d, 0d)); // pass

        pointsOfStudents.get(2)
                .addAll(Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d, 0d, 0d, 0d, 10d)); // pass

        pointsOfStudents.get(3)
                .addAll(Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d, 0d, 0d, 0d, 0d)); // fail

        pointsOfStudents.get(4)
                .addAll(Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 9d, 0d, 0d, 0d, 10d)); // fail


        for (int student = 0; student < students.size(); student++) {
            for (int exercisesNo = 0; exercisesNo < scheinExam.getExercises()
                    .size(); exercisesNo++) {
                students.get(student).setScheinExamResults(scheinExam,
                        scheinExam.getExercises().get(exercisesNo),
                        pointsOfStudents.get(student).get(exercisesNo));
            }
        }

        String examCriteriaJSON =
                "{\"identifer\":\"exam\",\"name\":\"Exam\",\"passAllExamsIndividually\":true,\"percentageOfAllPointsNeeded\": 0}";

        ScheinExamCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(examCriteriaJSON), ScheinExamCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "First student passed.");
        assertTrue(criteria.isPassed(students.get(1)), "Second student passed.");
        assertTrue(criteria.isPassed(students.get(2)), "Third student passed.");
        assertFalse(criteria.isPassed(students.get(3)), "Fourth student failed.");
        assertFalse(criteria.isPassed(students.get(4)), "Fifth student failed.");
    }

    @Test
    public void testMultipleExams() throws ElementNotFoundException, IOException {
        List<Student> students = createStudents(3, initTutorial(getDates()));

        ScheinExam firstExam = scheinExamService.createScheinExam(
                new ScheinExamDTO(1, createExercisesWith10PtsEach(5, 0), Instant.now(), 0.6));
        ScheinExam secondExam = scheinExamService.createScheinExam(
                new ScheinExamDTO(1, createExercisesWith10PtsEach(5, 0), Instant.now(), 0.6));

        List<List<Double>> firstPoints = new ArrayList<>();
        List<List<Double>> secondPoints = new ArrayList<>();

        for (int i = 0; i < students.size(); i++) {
            firstPoints.add(new ArrayList<>());
            secondPoints.add(new ArrayList<>());
        }

        // Pass both
        firstPoints.get(0).addAll(Arrays.asList(10d, 10d, 10d, 0d, 0d));
        secondPoints.get(0).addAll(Arrays.asList(10d, 10d, 10d, 10d, 0d));

        // Pass only one
        firstPoints.get(1).addAll(Arrays.asList(10d, 10d, 10d, 10d, 10d));
        secondPoints.get(1).addAll(Arrays.asList(10d, 10d, 0d, 0d, 0d));

        // Fail both
        firstPoints.get(2).addAll(Arrays.asList(10d, 0d, 0d, 0d, 0d));
        secondPoints.get(2).addAll(Arrays.asList(10d, 0d, 0d, 0d, 0d));

        for (int stNo = 0; stNo < students.size(); stNo++) {
            var student = students.get(stNo);

            for (int exNo = 0; exNo < firstExam.getExercises().size(); exNo++) {
                var exercise = firstExam.getExercises().get(exNo);

                student.setScheinExamResults(firstExam, exercise, firstPoints.get(stNo).get(exNo));
            }

            for (int exNo = 0; exNo < secondExam.getExercises().size(); exNo++) {
                var exercise = secondExam.getExercises().get(exNo);

                student.setScheinExamResults(secondExam, exercise,
                        secondPoints.get(stNo).get(exNo));
            }
        }

        String examCriteriaJSON =
                "{\"identifer\":\"exam\",\"name\":\"Exam\",\"passAllExamsIndividually\":true,\"percentageOfAllPointsNeeded\": 0}";

        ScheinExamCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(examCriteriaJSON), ScheinExamCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "First student passed.");
        assertFalse(criteria.isPassed(students.get(1)), "Second student failed.");
        assertFalse(criteria.isPassed(students.get(2)), "Third student failed.");
    }

    @Test
    public void testMultipleExamsInTotal() throws ElementNotFoundException, IOException {
        List<Student> students = createStudents(3, initTutorial(getDates()));

        ScheinExam firstExam = scheinExamService.createScheinExam(
                new ScheinExamDTO(1, createExercisesWith10PtsEach(5, 0), Instant.now(), 0.6));
        ScheinExam secondExam = scheinExamService.createScheinExam(
                new ScheinExamDTO(1, createExercisesWith10PtsEach(5, 0), Instant.now(), 0.6));

        List<List<Double>> firstPoints = new ArrayList<>();
        List<List<Double>> secondPoints = new ArrayList<>();

        for (int i = 0; i < students.size(); i++) {
            firstPoints.add(new ArrayList<>());
            secondPoints.add(new ArrayList<>());
        }

        // Pass both and in total (70%)
        firstPoints.get(0).addAll(Arrays.asList(10d, 10d, 10d, 0d, 0d));
        secondPoints.get(0).addAll(Arrays.asList(10d, 10d, 10d, 10d, 0d));

        // Pass in total (70%)
        firstPoints.get(1).addAll(Arrays.asList(10d, 10d, 10d, 10d, 10d));
        secondPoints.get(1).addAll(Arrays.asList(10d, 10d, 0d, 0d, 0d));

        // Fail both and in total (20%)
        firstPoints.get(2).addAll(Arrays.asList(10d, 0d, 0d, 0d, 0d));
        secondPoints.get(2).addAll(Arrays.asList(10d, 0d, 0d, 0d, 0d));

        for (int stNo = 0; stNo < students.size(); stNo++) {
            var student = students.get(stNo);

            for (int exNo = 0; exNo < firstExam.getExercises().size(); exNo++) {
                var exercise = firstExam.getExercises().get(exNo);

                student.setScheinExamResults(firstExam, exercise, firstPoints.get(stNo).get(exNo));
            }

            for (int exNo = 0; exNo < secondExam.getExercises().size(); exNo++) {
                var exercise = secondExam.getExercises().get(exNo);

                student.setScheinExamResults(secondExam, exercise,
                        secondPoints.get(stNo).get(exNo));
            }
        }

        String examCriteriaJSON =
                "{\"identifer\":\"exam\",\"name\":\"Exam\",\"passAllExamsIndividually\":false,\"percentageOfAllPointsNeeded\": 0.6}";

        ScheinExamCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(examCriteriaJSON), ScheinExamCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "First student passed.");
        assertTrue(criteria.isPassed(students.get(1)), "Second student passed.");
        assertFalse(criteria.isPassed(students.get(2)), "Third student failed.");
    }

    private List<Instant> getDates() {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        return dates;
    }
}
