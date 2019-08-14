package de.unistuttgart.iste.rss.tutormanagementsystem.model.team;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;

/**
 * CreateTeamDTO
 */
@Getter
public class TeamDTO {

    private int teamNo;
    private List<UUID> students;

    public TeamDTO() {
        this(1, new ArrayList<>());
    }

    public TeamDTO(final int teamNo, final List<UUID> students) {
        this.teamNo = teamNo;
        this.students = students;
    }
}
