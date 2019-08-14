package de.unistuttgart.iste.rss.tutormanagementsystem.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import de.unistuttgart.iste.rss.tutormanagementsystem.dao.model.ScheinExamDao;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.exceptions.ElementNotFoundException;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.Exercise;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.rating.ExerciseDTO;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExam;
import de.unistuttgart.iste.rss.tutormanagementsystem.model.scheinexam.ScheinExamDTO;

/**
 * ScheinExamService
 */

@Service
public class ScheinExamService {

    @Autowired
    private ScheinExamDao scheinExamDao;

    public ScheinExam createScheinExam(final ScheinExamDTO scheinExamDTO) {
        List<Exercise> exercises = new ArrayList<>();

        for (ExerciseDTO ex : scheinExamDTO.getExercises()) {
            exercises.add(new Exercise(ex.getExNo(), ex.getMaxPoints(), ex.isBonus()));
        }

        // Instant date = Instant.from(scheinExamDTO.getDate());

        ScheinExam exam = new ScheinExam(UUID.randomUUID(), scheinExamDTO.getScheinExamNo(),
                exercises, scheinExamDTO.getDate(), scheinExamDTO.getPercentageNeeded());

        var savedExam = scheinExamDao.saveScheinExam(exam);

        return savedExam;
    }

    public ScheinExam getScheinExam(final UUID id) throws ElementNotFoundException {
        return scheinExamDao.getScheinExam(id);
    }

    public List<ScheinExam> getAllScheinExams() {
        return scheinExamDao.getAllScheinExams();
    }

    public void deleteScheinExam(final UUID id) throws ElementNotFoundException {
        scheinExamDao.deleteScheinExam(id);
    }

    public ScheinExam updateScheinExam(final UUID id, final ScheinExamDTO updatedScheinExam)
            throws ElementNotFoundException {

        ScheinExam exam = getScheinExam(id);
        List<Exercise> exercises = new ArrayList<>();

        for (ExerciseDTO ex : updatedScheinExam.getExercises()) {
            exercises.add(new Exercise(ex.getExNo(), ex.getMaxPoints(), ex.isBonus()));
        }

        return scheinExamDao.saveScheinExam(
                new ScheinExam(exam.getId(), updatedScheinExam.getScheinExamNo(), exercises,
                        updatedScheinExam.getDate(), updatedScheinExam.getPercentageNeeded()));
    }
}
