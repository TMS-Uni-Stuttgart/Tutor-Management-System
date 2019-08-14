package de.unistuttgart.iste.rss.tutormanagementsystem.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.HasId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.Team;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.TeamDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.TeamResponseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TeamService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TutorialService;

/**
 * StudentControllerTest
 */
public class StudentControllerTest extends TestConfiguration {

    private final ZoneId UTC_ZONE = ZoneId.of("UTC");
    private Tutorial tutorial = null;

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private TeamService teamService;

    @BeforeEach
    public void initTutorial() throws ElementNotFoundException {
        TutorialDTO tutorialDTO = new TutorialDTO(42, null, new ArrayList<>(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), UTC_ZONE).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), UTC_ZONE).toLocalTime());

        tutorial = tutorialService.createTutorial(tutorialDTO);
    }

    @DisplayName("Create a student with no team.")
    @Test
    public void testCreatingStudentWithoutTeam() throws ElementNotFoundException {
        StudentDTO studentToCreate =
                new StudentDTO("Potter", "Harry", "1234567", null, tutorial.getId());

        StudentResponseDTO createdStudent = addStudentToDatabase(studentToCreate);

        assertStudentEqualsToCreateStudentDTO(studentToCreate, createdStudent);
    }

    @DisplayName("Create a student with a team.")
    @Test
    public void testCreatingStudenWithTeam() throws ElementNotFoundException {
        Team team = teamService.createTeam(tutorial.getId(), new TeamDTO());

        StudentDTO studentToCreate =
                new StudentDTO("Potter", "Harry", "1234567", team.getId(), tutorial.getId());

        StudentResponseDTO createdStudent = addStudentToDatabase(studentToCreate);

        assertStudentEqualsToCreateStudentDTO(studentToCreate, createdStudent);
    }

    @DisplayName("Get a Student with a specific ID.")
    @Test
    public void testGetStudentWithId() throws ElementNotFoundException {
        StudentDTO studentToCreate =
                new StudentDTO("Potter", "Harry", "1234567", null, tutorial.getId());

        StudentResponseDTO student = addStudentToDatabase(studentToCreate);

        ResponseEntity<StudentResponseDTO> getStudentResponse =
                restTemplate.getForEntity(getDatabaseURLToStudentEndpoint() + "/" + student.getId(),
                        StudentResponseDTO.class);

        StudentResponseDTO retrievedStudent = getStudentResponse.getBody();

        assertEquals(HttpStatus.OK, getStudentResponse.getStatusCode(),
                "Student was found on the server.");
        assertNotNull(retrievedStudent, "The response body contains the student.");

        assertStudentEquals(student, retrievedStudent);
    }

    @DisplayName("Delete a Student with no team.")
    @Test
    public void testDeleteStudentWithoutTeam() throws ElementNotFoundException {
        int currentStudentCount = getStudentsInDB().size();

        StudentDTO studentToCreate =
                new StudentDTO("Potter", "Harry", "1234567", null, tutorial.getId());

        StudentResponseDTO student = addStudentToDatabase(studentToCreate);

        restTemplate.delete(getDatabaseURLToStudentEndpoint() + "/" + student.getId());

        assertEquals(currentStudentCount, getStudentsInDB().size(),
                "Student was deleted from the database.");
    }

    @DisplayName("Delete a student with a team")
    @Test
    public void testDeleteStudentWithTeam() throws ElementNotFoundException {
        Team team = teamService.createTeam(tutorial.getId(), new TeamDTO());

        StudentDTO studentToCreate =
                new StudentDTO("Potter", "Harry", "1234567", team.getId(), tutorial.getId());
        StudentDTO secondStudentToCreate =
                new StudentDTO("Weasley", "Ron", "1234568", team.getId(), tutorial.getId());

        StudentResponseDTO student = addStudentToDatabase(studentToCreate);
        StudentResponseDTO secondStudent = addStudentToDatabase(secondStudentToCreate);

        int currentStudentCount = getStudentsInDB().size();

        String pathToTeam = "tutorial/" + tutorial.getId() + "/team/" + team.getId();

        ResponseEntity<TeamResponseDTO> teamResponseBeforeDeletion =
                restTemplate.getForEntity(getDatabaseURL(pathToTeam), TeamResponseDTO.class);
        TeamResponseDTO teamBeforeDeletion = teamResponseBeforeDeletion.getBody();

        assertEquals(HttpStatus.OK, teamResponseBeforeDeletion.getStatusCode(),
                "Team was retrieved from Database.");
        assertNotNull(teamBeforeDeletion, "Body of team response is not null.");
        assertTrue(() -> {
            List<UUID> students = HasId.convertToListOfUUIDs(teamBeforeDeletion.getStudents());

            return students.contains(student.getId());
        }, "Student is in team.");

        restTemplate.delete(getDatabaseURLToStudentEndpoint() + "/" + student.getId());

        assertEquals(currentStudentCount - 1, getStudentsInDB().size(),
                "Student was deleted from database.");

        ResponseEntity<TeamResponseDTO> teamResponse =
                restTemplate.getForEntity(getDatabaseURL(pathToTeam), TeamResponseDTO.class);

        assertEquals(HttpStatus.OK, teamResponse.getStatusCode(),
                "Team was retrieved from the database.");
        assertNotNull(teamResponse.getBody(), "Body of team response is not null.");
        assertTrue(() -> {
            List<UUID> studentsInTeam =
                    HasId.convertToListOfUUIDs(teamResponse.getBody().getStudents());

            return studentsInTeam.contains(secondStudent.getId())
                    && !studentsInTeam.contains(student.getId());
        }, "Student was removed from the team.");
    }

    @DisplayName("Delete last student in a team")
    @Test
    public void testDeleteLastStudentOfTeam() throws ElementNotFoundException {
        Team team = teamService.createTeam(tutorial.getId(), new TeamDTO());

        StudentDTO studentToCreate =
                new StudentDTO("Potter", "Harry", "1234567", team.getId(), tutorial.getId());

        StudentResponseDTO student = addStudentToDatabase(studentToCreate);

        String pathToTeam = "tutorial/" + tutorial.getId() + "/team/" + team.getId();

        ResponseEntity<TeamResponseDTO> teamResponseBeforeDeletion =
                restTemplate.getForEntity(getDatabaseURL(pathToTeam), TeamResponseDTO.class);
        TeamResponseDTO teamBeforeDeletion = teamResponseBeforeDeletion.getBody();

        assertEquals(HttpStatus.OK, teamResponseBeforeDeletion.getStatusCode(),
                "Team was retrieved from Database.");
        assertNotNull(teamBeforeDeletion, "Body of team response is not null.");
        assertTrue(() -> {
            List<UUID> students = HasId.convertToListOfUUIDs(teamBeforeDeletion.getStudents());

            return students.contains(student.getId());
        }, "Student is in team.");

        restTemplate.delete(getDatabaseURLToStudentEndpoint() + "/" + student.getId());

        List<Team> teams = teamService.getAllTeams(tutorial.getId());

        assertTrue(!teams.contains(team), "Team got removed");

    }

    /**
     * Checks if two Students are equal.
     * 
     * This function internally uses {@link Assertions} so it can be used inside JUnit tests.
     * 
     * @param expected What the Student object should be like.
     * @param actual What the Student object is.
     */
    private void assertStudentEquals(final StudentResponseDTO expected,
            final StudentResponseDTO actual) {
        assertNotNull(actual, "Student is not null.");
        assertEquals(expected.getId(), actual.getId(), "IDs match");
        assertEquals(expected.getLastname(), actual.getLastname(), "Lastname is correct");
        assertEquals(expected.getFirstname(), actual.getFirstname(), "First name is correct.");
        assertEquals(expected.getMatriculationNo(), actual.getMatriculationNo(),
                "Matriculation number is correct.");
        assertEquals(expected.getAttendance(), actual.getAttendance(), "Attendance is correct.");
        assertEquals(expected.getTeam(), actual.getTeam(), "Team is correct.");
        assertEquals(expected.getTutorial(), actual.getTutorial(), "Tutorial is correct.");
    }

    /**
     * Checks if the students are "equal".
     * 
     * Equality is defined as having the same attributes but one is represented as
     * {@see CreateStudentDTO} while the other is represented as {@see Student} and all attributes
     * are getting compared.
     * 
     * Uses JUnit assert functions internally, so it can be used inside JUnit tests.
     * 
     * @param expected Expected student structure.
     * @param actual Actual student object.
     */
    private void assertStudentEqualsToCreateStudentDTO(final StudentDTO expected,
            final StudentResponseDTO actual) {
        assertNotNull(actual, "Student is not null.");
        assertEquals(expected.getLastname(), actual.getLastname(), "Lastname is correct");
        assertEquals(expected.getFirstname(), actual.getFirstname(), "First name is correct.");
        assertEquals(expected.getMatriculationNo(), actual.getMatriculationNo(),
                "Matricolation Number is correct");
        assertTeamsInCreateStudentDTOAndStudentAreEqual(expected, actual);
        assertEquals(expected.getTutorial(), actual.getTutorial());
    }

    /**
     * Checks if the teams of students are "equal".
     * 
     * The equality of teams is defined as having both the same id or as beeing both empty.
     * 
     * Uses JUnit assert functions internally, so it can be used inside JUnit tests.
     * 
     * @param expected Expected student structure.
     * @param actual Actual student object.
     */
    private void assertTeamsInCreateStudentDTOAndStudentAreEqual(final StudentDTO expected,
            final StudentResponseDTO actual) {
        assertTrue(() -> {
            var expectedTeam = expected.getTeam();
            var actualTeam = actual.getTeam();

            if ((expectedTeam.isEmpty() && !actualTeam.isEmpty())
                    || (!expectedTeam.isEmpty() && actualTeam.isEmpty())) {
                return false;
            }

            if (expectedTeam.isEmpty() && actualTeam.isEmpty()) {
                return true;
            }

            return actualTeam.get().equals(expectedTeam.get());
        }, "Teams are equal.");
    }


    /**
     * Adds a student to the DB via a request.
     * 
     * This function also checks if the response has the correct status code aswell as that the
     * created student gets returned by the request. These checks are done with {@link Assertions}
     * so this function can be used inside JUnit tests.
     * 
     * @param studentToCreate Information of the Student to create.
     * @return The created Student
     */
    private StudentResponseDTO addStudentToDatabase(final StudentDTO studentToCreate) {
        // We cannot use the getForEntity method here bc in it one cannot specify a parameterized
        // type.
        int currentStudentCount = getStudentsInDB().size();

        ResponseEntity<StudentResponseDTO> createStudentResponse = restTemplate.postForEntity(
                getDatabaseURLToStudentEndpoint(), studentToCreate, StudentResponseDTO.class);

        StudentResponseDTO student = createStudentResponse.getBody();

        assertEquals(HttpStatus.CREATED, createStudentResponse.getStatusCode(),
                "Status code for successfully creating the student.");
        assertNotNull(student, "Created Student got returned.");

        assertEquals(currentStudentCount + 1, getStudentsInDB().size(),
                "Student was added to the database.");

        return student;
    }

    private List<StudentResponseDTO> getStudentsInDB() {
        ResponseEntity<List<StudentResponseDTO>> response =
                restTemplate.exchange(getDatabaseURLToStudentEndpoint(), HttpMethod.GET, null,
                        new ParameterizedTypeReference<List<StudentResponseDTO>>() {});

        return response.getBody();
    }

    /**
     * @return URL of the database server pointing to the /student endpoint.
     */
    private String getDatabaseURLToStudentEndpoint() {
        return getDatabaseURL("student");
    }
}
