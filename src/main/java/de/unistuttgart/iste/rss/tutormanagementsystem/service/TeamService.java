package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.TeamDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.Team;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.TeamDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.UpdatePointsDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;

/**
 * TeamService
 */
@Service
public class TeamService {

    @Autowired
    private TeamDao teamDao;

    @Autowired
    private SheetService sheetService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TutorialService tutorialService;

    public Team createTeam(final UUID tutorialId, final TeamDTO teamInfos)
            throws ElementNotFoundException {
        Tutorial tutorial = tutorialService.getTutorial(tutorialId);
        List<Student> students = new ArrayList<>();

        for (var id : teamInfos.getStudents()) {
            students.add(studentService.getStudent(id));
        }

        Team teamCreated = teamDao
                .saveTeam(new Team(UUID.randomUUID(), tutorial, teamInfos.getTeamNo(), students));

        for (var student : students) {
            studentService.setTeam(student.getId(), teamCreated);
        }

        return teamCreated;
    }

    public Team getTeam(final UUID tutorialId, final UUID id) throws ElementNotFoundException {
        return teamDao.getTeam(tutorialId, id);
    }

    public List<Team> getAllTeams(final UUID tutorialId) {
        return teamDao.getAllTeams(tutorialId);
    }

    public void deleteTeam(final UUID tutorialId, final UUID id) throws ElementNotFoundException {
        List<Student> students = getTeam(tutorialId, id).getStudents();

        for (var student : students) {
            student.setTeam(null);
        }

        teamDao.deleteTeam(id);
    }

    public Team updateTeam(final UUID tutorialId, final UUID id, final TeamDTO updatedTeam)
            throws ElementNotFoundException {
        Team team = getTeam(tutorialId, id);
        List<Student> students = new ArrayList<>();
        List<Student> oldStudents = new ArrayList<>(team.getStudents());

        for (var student : oldStudents) {
            studentService.removeTeam(student.getId());
        }

        teamDao.saveTeam(team);

        for (var studentId : updatedTeam.getStudents()) {
            Student student = studentService.setTeam(studentId, team);
            students.add(student);
        }

        return teamDao.saveTeam(
                new Team(team.getId(), team.getTutorial(), updatedTeam.getTeamNo(), students));
    }

    public void setPoints(final UUID tutorialId, final UUID id, final UpdatePointsDTO points)
            throws ElementNotFoundException {
        Team team = getTeam(tutorialId, id);
        Sheet sheet = sheetService.getSheet(points.getId());

        for (var entry : points.getExercises().entrySet()) {
            Optional<Exercise> exercise = sheet.getExercises().stream()
                    .filter(e -> entry.getKey().equals(e.getExNo())).findFirst();

            if (exercise.isPresent()) {
                team.setPoints(sheet, exercise.get(), entry.getValue());
            }
        }

        teamDao.saveTeam(team);
    }
}
