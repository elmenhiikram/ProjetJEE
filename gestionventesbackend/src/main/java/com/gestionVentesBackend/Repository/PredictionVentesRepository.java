package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.PredictionVentes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PredictionVentesRepository extends JpaRepository<PredictionVentes, Long> {
    List<PredictionVentes> findByAnneeOrderByMoisAsc(Integer annee);
    List<PredictionVentes> findByAnneeAndMois(Integer annee, Integer mois);
}
