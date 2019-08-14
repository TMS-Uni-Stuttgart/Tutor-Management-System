package de.unistuttgart.iste.rss.tutormanagementsystem.scheincriteria;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.PresentationCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinCriteriaService;

@Transactional
public class PresentationCriteriaTest extends TestHelperFunctions {

    @Autowired
    ScheinCriteriaService scheinCriteriaService;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void testPresentationCriteria()
            throws ElementNotFoundException, JsonProcessingException, IOException {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        List<Student> students = createStudents(2, initTutorial(dates));
        List<Sheet> sheets = createSheets(5, 0, 4, 0);

        int studentNo = 0;

        students.get(studentNo).setPresentationPoints(sheets.get(0).getId(), 1);
        students.get(studentNo).setPresentationPoints(sheets.get(1).getId(), 2);
        students.get(studentNo).setPresentationPoints(sheets.get(2).getId(), 1); // pass

        studentNo = 1;

        students.get(studentNo).setPresentationPoints(sheets.get(0).getId(), 1);
        students.get(studentNo).setPresentationPoints(sheets.get(1).getId(), 1);
        students.get(studentNo).setPresentationPoints(sheets.get(2).getId(), 1); // fail

        String attendanceJSON =
                "{\"identifer\":\"presentation\",\"name\":\"Presentationen\",\"percentage\":false,\"presentationsNeeded\": 4}";

        PresentationCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(attendanceJSON), PresentationCriteria.class);

        assertTrue(criteria.isPassed(students.get(0)), "First student passed.");
        assertFalse(criteria.isPassed(students.get(1)), "Second student failed.");
    }
}
