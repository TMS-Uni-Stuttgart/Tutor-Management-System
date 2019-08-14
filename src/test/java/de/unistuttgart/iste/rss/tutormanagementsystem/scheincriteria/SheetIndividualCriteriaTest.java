package de.unistuttgart.iste.rss.tutormanagementsystem.scheincriteria;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.SheetIndividualCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinCriteriaService;

@Transactional
public class SheetIndividualCriteriaTest extends TestHelperFunctions {

    @Autowired
    ScheinCriteriaService scheinCriteriaService;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void testSheetIndiviualCriteriaWithPercentageAndPercentagePerSheet()
            throws ElementNotFoundException, JsonProcessingException, IOException {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        int studentNo = 7;

        List<Student> students = createStudents(studentNo, initTutorial(dates));

        List<Sheet> sheets = createSheets(5, 1, 7, 1); // 5 Blätter wovon 1 Bonus, je 7
                                                       // Aufgaben
        // wovon 1 Bonus (bis auf Bonusblatt -> nur 6 Aufgaben)

        List<List<List<Double>>> pointsOfStudents = new ArrayList<List<List<Double>>>();

        for (int i = 0; i < studentNo; i++) {
            pointsOfStudents.add(new ArrayList<List<Double>>());
        }

        pointsOfStudents.get(0)
                .addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d) // pass
                ));

        pointsOfStudents.get(1).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(2).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 8d),
                Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 8d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(3).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d) // pass
        ));

        pointsOfStudents.get(4).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // fail
        ));

        pointsOfStudents.get(5).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(1d, 1d, 0d, 0d, 0d, 0d) // fail
        ));

        pointsOfStudents.get(6).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d) // fail
        ));


        for (Sheet sheet : sheets) {
            for (Student student : students) {
                for (Exercise exercise : sheet.getExercises()) {
                    student.setPoints(sheet, exercise,
                            pointsOfStudents.get(students.indexOf(student))
                                    .get(sheets.indexOf(sheet))
                                    .get(sheet.getExercises().indexOf(exercise)));
                }

            }
        }


        String attendanceJSON =
                "{\"identifer\":\"sheetIndividual\",\"name\":\"sheetIndividual\",\"percentage\":true,\"percentagePerSheet\":true,\"valueNeeded\": 0.5,\"valuePerSheetNeeded\": 0.8}";

        // 50% (2) aller Blätter, mind. 80% (48pkt) pro Blatt

        SheetIndividualCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(attendanceJSON), SheetIndividualCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "1st student passed.");
        assertTrue(criteria.isPassed(students.get(1)), "2nd student passed.");
        assertTrue(criteria.isPassed(students.get(2)), "3th student passed.");
        assertTrue(criteria.isPassed(students.get(3)), "4th student passed.");
        assertFalse(criteria.isPassed(students.get(4)), "5th student failed.");
        assertFalse(criteria.isPassed(students.get(5)), "6th student failed.");
        assertFalse(criteria.isPassed(students.get(6)), "7th student failed.");
    }

    @Test
    public void testSheetIndiviualCriteriaWithPercentageAndWithoutPercentagePerSheet()
            throws ElementNotFoundException, JsonProcessingException, IOException {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        int studentNo = 7;

        List<Student> students = createStudents(studentNo, initTutorial(dates));

        List<Sheet> sheets = createSheets(5, 1, 7, 1); // 5 Blätter wovon 1 Bonus, je 7
                                                       // Aufgaben
                                                       // wovon 1 Bonus

        List<List<List<Double>>> pointsOfStudents = new ArrayList<List<List<Double>>>();

        for (int i = 0; i < studentNo; i++) {
            pointsOfStudents.add(new ArrayList<List<Double>>());
        }

        pointsOfStudents.get(0)
                .addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d) // pass
                ));

        pointsOfStudents.get(1).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(2).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 8d),
                Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 8d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(3).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d) // pass
        ));

        pointsOfStudents.get(4).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // fail
        ));

        pointsOfStudents.get(5).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(1d, 1d, 0d, 0d, 0d, 0d) // fail
        ));

        pointsOfStudents.get(6).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d) // fail
        ));


        for (Sheet sheet : sheets) {
            for (Student student : students) {
                for (Exercise exercise : sheet.getExercises()) {
                    student.setPoints(sheet, exercise,
                            pointsOfStudents.get(students.indexOf(student))
                                    .get(sheets.indexOf(sheet))
                                    .get(sheet.getExercises().indexOf(exercise)));
                }

            }
        }


        String attendanceJSON =
                "{\"identifer\":\"sheetIndividual\",\"name\":\"sheetIndividual\",\"percentage\":true,\"percentagePerSheet\":false,\"valueNeeded\": 0.5,\"valuePerSheetNeeded\": 48}";

        // 50% (2) aller Blätter, mind. 48pkt pro Blatt

        SheetIndividualCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(attendanceJSON), SheetIndividualCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "1st student passed.");
        assertTrue(criteria.isPassed(students.get(1)), "2nd student passed.");
        assertTrue(criteria.isPassed(students.get(2)), "3rd student passed.");
        assertTrue(criteria.isPassed(students.get(3)), "4th student passed.");
        assertFalse(criteria.isPassed(students.get(4)), "5th student failed.");
        assertFalse(criteria.isPassed(students.get(5)), "6th student failed.");
        assertFalse(criteria.isPassed(students.get(6)), "7th student failed.");
    }

    @Test
    public void testSheetIndiviualCriteriaWithoutPercentageAndPercentagePerSheet()
            throws ElementNotFoundException, JsonProcessingException, IOException {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        int studentNo = 7;

        List<Student> students = createStudents(studentNo, initTutorial(dates));

        List<Sheet> sheets = createSheets(5, 1, 7, 1); // 5 Blätter wovon 1 Bonus, je 7
                                                       // Aufgaben
                                                       // wovon 1 Bonus

        List<List<List<Double>>> pointsOfStudents = new ArrayList<List<List<Double>>>();

        for (int i = 0; i < studentNo; i++) {
            pointsOfStudents.add(new ArrayList<List<Double>>());
        }

        pointsOfStudents.get(0)
                .addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d, 10d),
                        Arrays.asList(10d, 10d, 10d, 10d, 10d, 10d) // pass
                ));

        pointsOfStudents.get(1).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(2).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 8d),
                Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 8d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(3).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d) // pass
        ));

        pointsOfStudents.get(4).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // fail
        ));

        pointsOfStudents.get(5).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(1d, 1d, 0d, 0d, 0d, 0d) // fail
        ));

        pointsOfStudents.get(6).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 8d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(10d, 10d, 10d, 10d, 7d, 0d) // fail
        ));


        for (Sheet sheet : sheets) {
            for (Student student : students) {
                for (Exercise exercise : sheet.getExercises()) {
                    student.setPoints(sheet, exercise,
                            pointsOfStudents.get(students.indexOf(student))
                                    .get(sheets.indexOf(sheet))
                                    .get(sheet.getExercises().indexOf(exercise)));
                }

            }
        }


        String attendanceJSON =
                "{\"identifer\":\"sheetIndividual\",\"name\":\"sheetIndividual\",\"percentage\":false,\"percentagePerSheet\":false,\"valueNeeded\": 2,\"valuePerSheetNeeded\": 48}";

        // 2 aller Blätter, mind. 48pkt pro Blatt

        SheetIndividualCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(attendanceJSON), SheetIndividualCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "1st student passed.");
        assertTrue(criteria.isPassed(students.get(1)), "2nd student passed.");
        assertTrue(criteria.isPassed(students.get(2)), "3rd student passed.");
        assertTrue(criteria.isPassed(students.get(3)), "4th student passed.");
        assertFalse(criteria.isPassed(students.get(4)), "5th student failed.");
        assertFalse(criteria.isPassed(students.get(5)), "6th student failed.");
        assertFalse(criteria.isPassed(students.get(6)), "7th student failed.");
    }

}
