package de.unistuttgart.iste.rss.tutormanagementsystem.model.student;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import javax.annotation.Nullable;
import javax.persistence.Convert;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.MapKeyColumn;
import javax.validation.constraints.NotBlank;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import de.unistuttgart.iste.rss.tutormanagementsystem.encrypter.StringAttibuteEncrypter;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.NamedElement;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.attendance.Attendance;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.jsonconverter.PointIdKeyDeserializer;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.HasPoints;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.PointId;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExam;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.team.Team;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import lombok.Getter;
import lombok.Setter;

/**
 * Model class which holds all information about a particular student and servers as an
 * {@link Entity} to save that student in the database.
 */
@Getter
@Entity
public class Student extends NamedElement implements HasPoints {
    @Convert(converter = StringAttibuteEncrypter.class)
    @NotBlank(message = "Missing matriculatione Number")
    private final String matriculationNo;

    @Convert(converter = StringAttibuteEncrypter.class)
    private final String email;

    @Convert(converter = StringAttibuteEncrypter.class)
    private final String courseOfStudies;

    @ManyToOne
    @Nullable
    @Setter
    private Team team;

    @ManyToOne
    private final Tutorial tutorial;

    @ElementCollection
    private final Map<Instant, Attendance> attendance;

    @JsonDeserialize(keyUsing = PointIdKeyDeserializer.class)
    @ElementCollection
    private final Map<PointId, Double> points;

    @ElementCollection
    @MapKeyColumn(length = 16)
    private final Map<UUID, Double> presentationPoints;

    @JsonDeserialize(keyUsing = PointIdKeyDeserializer.class)
    @ElementCollection
    private final Map<PointId, Double> scheinExamResults;

    public Student() {
        this(UUID.randomUUID(), "", "", "", "", "", null, Tutorial.DUMMYT_TUTORIAL);
    }

    public Student(final Student student) {
        this(student.getId(), student.getLastname(), student.getFirstname(),
                student.getMatriculationNo(), student.getEmail(), student.getCourseOfStudies(),
                student.team, student.getTutorial(), student.getAttendance(), student.getPoints(),
                student.getPresentationPoints(), student.getScheinExamResults());
    }

    public Student(final UUID id, final String lastname, final String firstname,
            final String matriculationNo, final Team team, final Tutorial tutorial) {
        this(id, lastname, firstname, matriculationNo, "", "", team, tutorial, new HashMap<>(),
                new HashMap<>(), new HashMap<>(), new HashMap<>());
    }

    public Student(final UUID id, final String lastname, final String firstname,
            final String matriculationNo, final String email, final String courseOfStudies,
            final Team team, final Tutorial tutorial) {
        this(id, lastname, firstname, matriculationNo, email, courseOfStudies, team, tutorial,
                new HashMap<>(), new HashMap<>(), new HashMap<>(), new HashMap<>());
    }

    public Student(final UUID id, final String lastname, final String firstname,
            final String matriculationNo, final String email, final String courseOfStudies,
            final Team team, final Tutorial tutorial, final Map<Instant, Attendance> attendances,
            final Map<PointId, Double> points, final Map<UUID, Double> presentationPoints,
            final Map<PointId, Double> scheinExamResults) {

        super(id, lastname, firstname);

        this.matriculationNo = matriculationNo;
        this.email = email;
        this.courseOfStudies = courseOfStudies;
        this.team = team;
        this.tutorial = tutorial;

        this.attendance = new HashMap<>(attendances);
        this.points = new HashMap<>(points);
        this.presentationPoints = new HashMap<>(presentationPoints);
        this.scheinExamResults = new HashMap<>(scheinExamResults);
    }

    public void setAttendanceState(final Instant date, final Attendance attendance) {
        this.attendance.put(date, attendance);
    }

    public Optional<Team> getTeam() {
        return Optional.ofNullable(team);
    }

    /**
     * Returns a map containing the points of this student. <br />
     * The map will combine the points of the student itself aswell as the points from the team (if
     * the students has one). However own points will always take precedence over the points of the
     * team.
     * 
     * @return Map containing the points if this student.
     */
    public Map<PointId, Double> getPointsOfStudent() {
        Map<PointId, Double> pointMap = new HashMap<>();

        if (team != null) {
            pointMap.putAll(team.getPoints());
        }

        pointMap.putAll(this.points);

        return pointMap;
    }

    @Override
    public void setPoints(final Sheet sheet, final Exercise exercise, final double points) {
        setPoints(sheet.getId(), exercise.getExNo(), points);
    }

    private void setPoints(final UUID sheetId, final int exerciseNo, final double points) {
        PointId id = new PointId(sheetId, exerciseNo);
        this.points.put(id, points);
    }

    @Override
    public boolean hasPoints(final Sheet sheet, final Exercise exercise) {
        return hasPoints(new PointId(sheet, exercise));
    }

    private boolean hasPoints(final PointId id) {
        return this.points.containsKey(id);
    }

    private boolean hasScheinExamPoints(final PointId id) {
        return this.scheinExamResults.containsKey(id);
    }

    public void setPresentationPoints(final UUID sheetId, final double points) {
        if (points == 0 && this.presentationPoints.containsKey(sheetId)) {
            this.presentationPoints.remove(sheetId);
            return;
        }

        this.presentationPoints.put(sheetId, points);
    }

    @Override
    public Optional<Double> getPoints(final Sheet sheet, final Exercise exercise) {
        PointId id = new PointId(sheet, exercise);

        if (hasPoints(id)) {
            return Optional.ofNullable(points.get(id));
        }

        if (team != null) {
            return team.getPoints(sheet, exercise);
        }

        return Optional.empty();
    }

    public double getPoints(final Sheet sheet) {
        double result = 0d;

        for (Exercise exercise : sheet.getExercises()) {
            result += getPoints(sheet, exercise).orElse(0d);
        }

        return result;
    }

    /**
     * Moves all points from the own team to the student itself. <br />
     * If the student has a team all points from this team will get copied over to the student
     * itself. However if the student has points for a specific exercise (ie same Sheet & Exercise)
     * than the points of the team will get ignored. This is due to the fact that points of a
     * student have a higher priority than points of a team.
     */
    public void movePointsFromTeamToStudent() {
        Optional<Team> teamOfStudent = this.getTeam();

        if (teamOfStudent.isEmpty()) {
            return;
        }

        Team team = teamOfStudent.get();

        for (var entry : team.getPoints().entrySet()) {
            PointId id = entry.getKey();

            if (!hasPoints(id)) {
                setPoints(id.getId(), id.getExerciseNo(), entry.getValue());
            }
        }
    }

    public Optional<Double> getScheinExamResult(final ScheinExam exam, final Exercise exercise) {
        PointId id = new PointId(exam, exercise);

        if (hasScheinExamPoints(id)) {
            return Optional.ofNullable(this.scheinExamResults.get(id));
        }


        return Optional.empty();
    }

    public double getScheinExamResult(final ScheinExam exam) {
        double result = 0d;

        for (Exercise exercise : exam.getExercises()) {
            result += getScheinExamResult(exam, exercise).orElse(0d);
        }

        return result;
    }

    public void setScheinExamResults(final ScheinExam scheinExam, final Exercise exercise,
            final double points) {
        PointId id = new PointId(scheinExam.getId(), exercise.getExNo());
        this.scheinExamResults.put(id, points);
    }

}
