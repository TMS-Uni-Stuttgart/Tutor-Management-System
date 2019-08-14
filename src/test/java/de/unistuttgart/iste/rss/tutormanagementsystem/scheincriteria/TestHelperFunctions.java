package de.unistuttgart.iste.rss.tutormanagementsystem.scheincriteria;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import de.unistuttgart.iste.rss.tutormanagementsystem.api.TestConfiguration;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.ExerciseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Sheet;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.SheetDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.Student;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.student.StudentDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.Tutorial;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.tutorial.TutorialDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.SheetService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.StudentService;
import de.unistuttgart.iste.rss.tutormanagementsystem.service.TutorialService;

public class TestHelperFunctions extends TestConfiguration {

    private final ZoneId UTC_ZONE = ZoneId.of("UTC");

    @Autowired
    private TutorialService tutorialService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private SheetService sheetService;

    protected Tutorial initTutorial(final List<Instant> dates) throws ElementNotFoundException {
        return tutorialService.createTutorial(new TutorialDTO(42, null, dates,
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(9, 45), UTC_ZONE).toLocalTime(),
                ZonedDateTime.of(LocalDate.now(), LocalTime.of(11, 15), UTC_ZONE).toLocalTime()));
    }

    protected Student addStudent(final UUID tutorialId, final String firstname,
            final String lastname, final String matrik) throws ElementNotFoundException {
        return studentService
                .createStudent(new StudentDTO(lastname, firstname, matrik, null, tutorialId));
    }

    protected List<Student> createStudents(final int count, final Tutorial tutorial)
            throws ElementNotFoundException {
        List<Student> students = new ArrayList<Student>();

        for (int i = 0; i < count; i++) {
            students.add(addStudent(tutorial.getId(), String.valueOf(i), String.valueOf(i),
                    "" + i + i + i + i + i + i + i));
        }

        return students;
    }

    protected List<Sheet> createSheets(final int sheetCount, final int bonusSheetCount,
            final int exercisesPerSheet, final int bonusExercisesPerSheet) {
        List<Sheet> sheets = new ArrayList<Sheet>();

        for (int i = 0; i < sheetCount; i++) {
            if (i < sheetCount - bonusSheetCount) {
                List<ExerciseDTO> exercises =
                        createExercisesWith10PtsEach(exercisesPerSheet, bonusExercisesPerSheet);
                sheets.add(sheetService.createSheet(new SheetDTO(i, exercises, false)));
            } else {
                List<ExerciseDTO> exercises =
                        createExercisesWith10PtsEach(exercisesPerSheet - 1, 0);
                sheets.add(sheetService.createSheet(new SheetDTO(i, exercises, true)));
            }
        }

        return sheets;
    }

    protected List<ExerciseDTO> createExercisesWith10PtsEach(final int exercisesCount,
            final int bonusCount) {
        List<ExerciseDTO> exercises = new ArrayList<ExerciseDTO>();

        for (int y = 0; y < exercisesCount; y++) {
            if (y < exercisesCount - bonusCount) {
                exercises.add(new ExerciseDTO(y, 10, false));
            } else {
                exercises.add(new ExerciseDTO(y, 10, true));
            }
        }

        return exercises;
    }
}
