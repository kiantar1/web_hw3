package com.drawingapp.repository;

import com.drawingapp.entity.Painting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaintingRepository extends JpaRepository<Painting, Long> {
    List<Painting> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<Painting> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
