package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceState;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.AttendanceDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.StudentService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TutorialService;

/**
 * AttendanceControllerTest
 */
public class AttendanceControllerTest extends TestConfiguration {

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private StudentService studentService;

    private Tutorial addTutorial() throws ElementNotFoundException {
        return tutorialService.createTutorial(new TutorialDTO(17, null, new ArrayList<>(),
                LocalTime.parse("09:45:30"), LocalTime.parse("11:15:30")));
    }

    private Student addStudent(final UUID tutorialId) throws ElementNotFoundException {
        return studentService
                .createStudent(new StudentDTO("Potter", "Ginny", "7632541", null, tutorialId));
    }

    @DisplayName("Set attendance state of a student without the state")
    @Test
    public void setAttendanceOfAStudent() throws ElementNotFoundException {
        final Tutorial tutorial = addTutorial();
        final Student student = addStudent(tutorial.getId());

        assertEquals(0, student.getAttendance().size(),
                "Student does not have any attendances set.");

        final AttendanceDTO attendanceDTO = new AttendanceDTO(AttendanceState.PRESENT,
                Instant.parse("2019-07-06T00:00:00.00Z"));

        final ResponseEntity<Attendance> attendanceResponse = restTemplate.exchange(
                getDatabaseURLToStudentEndpoint() + "/" + student.getId() + "/attendance",
                HttpMethod.PUT, new HttpEntity<>(attendanceDTO),
                new ParameterizedTypeReference<Attendance>() {});

        assertEquals(HttpStatus.OK, attendanceResponse.getStatusCode(), "Request was successful");
        assertNotNull(attendanceResponse.getBody(), "Response body is not null.");

        assertAttendanceEqualsAttendanceDTO(attendanceDTO, attendanceResponse.getBody());
    }

    @DisplayName("Update attendance state of a student with an already set state")
    @Test
    public void updateAttendanceOfAStudent() throws ElementNotFoundException {
        final Tutorial tutorial = addTutorial();
        final Student student = addStudent(tutorial.getId());
        final Instant date = Instant.parse("2019-07-06T00:00:00.00Z");

        AttendanceDTO previousDTO = new AttendanceDTO(AttendanceState.PRESENT, date);

        restTemplate.put(getDatabaseURLToStudentEndpoint() + "/" + student.getId() + "/attendance",
                previousDTO);

        AttendanceDTO updatedDTO = new AttendanceDTO(AttendanceState.EXCUSED, date, "Illness");

        ResponseEntity<Attendance> attendanceResponse = restTemplate.exchange(
                getDatabaseURLToStudentEndpoint() + "/" + student.getId() + "/attendance",
                HttpMethod.PUT, new HttpEntity<>(updatedDTO),
                new ParameterizedTypeReference<Attendance>() {});

        assertEquals(HttpStatus.OK, attendanceResponse.getStatusCode(), "Request was successful");
        assertNotNull(attendanceResponse.getBody(), "Response body is not null.");

        assertAttendanceEqualsAttendanceDTO(updatedDTO, attendanceResponse.getBody());
    }

    /**
     * Checks if the attendances are "equal".
     * 
     * Equality is defined as having the same attributes but one is represented as
     * {@see AttendanceDTO} while the other is represented as {@see Attendance} and all attributes
     * are getting compared.
     * 
     * Uses JUnit assert functions internally, so it can be used inside JUnit tests.
     * 
     * @param expected Expected attendance structure.
     * @param actual Actual attendance object.
     */
    private void assertAttendanceEqualsAttendanceDTO(final AttendanceDTO expected,
            final Attendance actual) {
        assertEquals(expected.getDate(), actual.getDate(), "Dates are equal.");
        assertEquals(expected.getState(), actual.getState(), "Attendance state is the same");
        assertEquals(expected.getNote(), actual.getNote(), "The notes are the same");
    }

    /**
     * @return URL of the database server pointing to the /student endpoint.
     */
    private String getDatabaseURLToStudentEndpoint() {
        return getDatabaseURL("student");
    }
}
