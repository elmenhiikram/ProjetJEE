package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.KpiGlobal;
import com.gestionVentesBackend.Model.PredictionVentes;
import com.gestionVentesBackend.Repository.KpiGlobalRepository;
import com.gestionVentesBackend.Repository.PredictionVentesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * APIs analytiques READ-ONLY.
 *
 * IMPORTANT: aucun calcul ici. Les données proviennent des tables analytiques
 * alimentées par le pipeline Python ETL.
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AnalyticsController {

    @Autowired
    private KpiGlobalRepository kpiGlobalRepository;

    @Autowired
    private PredictionVentesRepository predictionVentesRepository;

    @GetMapping("/kpi-global")
    public ResponseEntity<List<KpiGlobal>> getKpiGlobal(
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam(value = "mois", required = false) Integer mois
    ) {
        if (annee != null && mois != null) {
            return ResponseEntity.ok(kpiGlobalRepository.findByAnneeAndMois(annee, mois));
        }
        if (annee != null) {
            return ResponseEntity.ok(kpiGlobalRepository.findByAnneeOrderByMoisAsc(annee));
        }
        return ResponseEntity.ok(kpiGlobalRepository.findAll());
    }

    @GetMapping("/prediction-ventes")
    public ResponseEntity<List<PredictionVentes>> getPredictionVentes(
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam(value = "mois", required = false) Integer mois
    ) {
        if (annee != null && mois != null) {
            return ResponseEntity.ok(predictionVentesRepository.findByAnneeAndMois(annee, mois));
        }
        if (annee != null) {
            return ResponseEntity.ok(predictionVentesRepository.findByAnneeOrderByMoisAsc(annee));
        }
        return ResponseEntity.ok(predictionVentesRepository.findAll());
    }
}
