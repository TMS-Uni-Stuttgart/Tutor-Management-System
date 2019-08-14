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
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceState;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheincriteria.AttendanceCriteria;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.ScheinCriteriaService;

@Transactional
public class AttendanceCriteriaTest extends TestHelperFunctions {

    @Autowired
    ScheinCriteriaService scheinCriteriaService;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void testAttendanceCriteriaWithoutPercentage()
            throws ElementNotFoundException, JsonProcessingException, IOException {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        List<Student> students = createStudents(5, initTutorial(dates));

        int studentNo = 0;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.PRESENT)); // pass

        studentNo = 1;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.UNEXCUSED)); // pass

        studentNo = 2;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.UNEXCUSED));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.EXCUSED)); // pass

        studentNo = 3;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.UNEXCUSED));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.UNEXCUSED)); // fail

        studentNo = 4;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.EXCUSED));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.UNEXCUSED));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.UNEXCUSED)); // fail

        String attendanceJSON =
                "{\"identifer\":\"attendance\",\"name\":\"Anwesenheit\",\"percentage\":false,\"valueNeeded\":4}";

        AttendanceCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(attendanceJSON), AttendanceCriteria.class);


        assertTrue(criteria.isPassed(students.get(0)), "Student hat bestanden");
        assertTrue(criteria.isPassed(students.get(1)), "Student hat bestanden");
        assertTrue(criteria.isPassed(students.get(2)), "Student hat bestanden");
        assertFalse(criteria.isPassed(students.get(3)), "Student hat nicht bestanden");
        assertFalse(criteria.isPassed(students.get(4)), "Student hat nicht bestanden");
    }

    @Test
    public void testAttendanceCriteriaWithPercentage()
            throws ElementNotFoundException, JsonProcessingException, IOException {
        List<Instant> dates = new ArrayList<Instant>();

        dates.add(Instant.parse("2019-08-01T14:48:20Z"));
        dates.add(Instant.parse("2019-08-02T14:48:20Z"));
        dates.add(Instant.parse("2019-08-03T14:48:20Z"));
        dates.add(Instant.parse("2019-08-04T14:48:20Z"));
        dates.add(Instant.parse("2019-08-05T14:48:20Z"));

        List<Student> students = createStudents(5, initTutorial(dates));

        int studentNo = 0;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.PRESENT)); // pass

        studentNo = 1;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.UNEXCUSED)); // pass

        studentNo = 2;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.UNEXCUSED));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.EXCUSED)); // pass

        studentNo = 3;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.UNEXCUSED));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.UNEXCUSED)); // fail

        studentNo = 4;

        students.get(studentNo).setAttendanceState(dates.get(0), new Attendance(
                students.get(studentNo).getId(), dates.get(0), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(1), new Attendance(
                students.get(studentNo).getId(), dates.get(1), AttendanceState.PRESENT));
        students.get(studentNo).setAttendanceState(dates.get(2), new Attendance(
                students.get(studentNo).getId(), dates.get(2), AttendanceState.EXCUSED));
        students.get(studentNo).setAttendanceState(dates.get(3), new Attendance(
                students.get(studentNo).getId(), dates.get(3), AttendanceState.UNEXCUSED));
        students.get(studentNo).setAttendanceState(dates.get(4), new Attendance(
                students.get(studentNo).getId(), dates.get(4), AttendanceState.UNEXCUSED)); // fail

        String attendanceJSON =
                "{\"identifer\":\"attendance\",\"name\":\"Anwesenheit\",\"percentage\":true,\"valueNeeded\": 0.8}";

        AttendanceCriteria criteria = objectMapper
                .treeToValue(objectMapper.readTree(attendanceJSON), AttendanceCriteria.class);


        assertTrue(criteria.isPassed(students.get(0)), "First student passed.");
        assertTrue(criteria.isPassed(students.get(1)), "Second student passed.");
        assertTrue(criteria.isPassed(students.get(2)), "Third student passed.");
        assertFalse(criteria.isPassed(students.get(3)), "Fourth student failed.");
        assertFalse(criteria.isPassed(students.get(4)), "Fifth student failed.");
    }

}
