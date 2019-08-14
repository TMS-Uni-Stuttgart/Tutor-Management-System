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
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.SheetTotalCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinCriteriaService;

@Transactional
public class SheetTotalCriteriaTest extends TestHelperFunctions {

    @Autowired
    ScheinCriteriaService scheinCriteriaService;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void testSheetTotalCriteriaWithPercentageTest()
            throws ElementNotFoundException, JsonProcessingException, IOException {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        int studentNo = 6;

        List<Student> students = createStudents(studentNo, initTutorial(dates));

        List<Sheet> sheets = createSheets(5, 1, 7, 1); // 5 Blätter wovon 1 Bonus, je 7 Aufgaben
                                                       // wovon 1 Bonus (bis auf Bonusblatt -> nur 6
                                                       // Aufgaben)

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

        pointsOfStudents.get(1).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(2).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 10d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(3).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 10d) // pass
        ));

        pointsOfStudents.get(4).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 9d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // fail
        ));

        pointsOfStudents.get(5).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 9d) // fail
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
                "{\"identifer\":\"sheetTotal\",\"name\":\"sheetTotal\",\"percentage\":true,\"valueNeeded\": 0.5}";

        // 50% (120pkt) aller Punkte von allen Blätter

        SheetTotalCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(attendanceJSON), SheetTotalCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "Student hat bestanden");
        assertTrue(criteria.isPassed(students.get(1)), "Student hat bestanden");
        assertTrue(criteria.isPassed(students.get(2)), "Student hat bestanden");
        assertTrue(criteria.isPassed(students.get(3)), "Student hat bestanden");
        assertFalse(criteria.isPassed(students.get(4)), "Student hat nicht bestanden");
        assertFalse(criteria.isPassed(students.get(5)), "Student hat nicht bestanden");
    }

    @Test
    public void testSheetTotalCriteriaWithoutPercentageTest()
            throws ElementNotFoundException, JsonProcessingException, IOException {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        int studentNo = 6;

        List<Student> students = createStudents(studentNo, initTutorial(dates));

        List<Sheet> sheets = createSheets(5, 1, 7, 1); // 5 Blätter wovon 1 Bonus, je 7 Aufgaben
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

        pointsOfStudents.get(1).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(2).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 10d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // pass
        ));

        pointsOfStudents.get(3).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 0d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 10d) // pass
        ));

        pointsOfStudents.get(4).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 9d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d) // fail
        ));

        pointsOfStudents.get(5).addAll(Arrays.asList(Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 10d, 10d, 10d, 10d, 0d, 0d),
                Arrays.asList(10d, 0d, 0d, 0d, 0d, 0d, 0d),
                Arrays.asList(0d, 0d, 0d, 0d, 0d, 0d, 0d), Arrays.asList(0d, 0d, 0d, 0d, 0d, 9d) // fail
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
                "{\"identifer\":\"sheetTotal\",\"name\":\"sheetTotal\",\"percentage\":false,\"valueNeeded\": 120}";

        // 50% (120pkt) aller Punkte von allen Blätter

        SheetTotalCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(attendanceJSON), SheetTotalCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "Student hat bestanden");
        assertTrue(criteria.isPassed(students.get(1)), "Student hat bestanden");
        assertTrue(criteria.isPassed(students.get(2)), "Student hat bestanden");
        assertTrue(criteria.isPassed(students.get(3)), "Student hat bestanden");
        assertFalse(criteria.isPassed(students.get(4)), "Student hat nicht bestanden");
        assertFalse(criteria.isPassed(students.get(5)), "Student hat nicht bestanden");
    }

}
