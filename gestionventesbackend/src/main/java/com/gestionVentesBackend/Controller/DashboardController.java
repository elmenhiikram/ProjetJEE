package com.gestionVentesBackend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gestionVentesBackend.Repository.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @Autowired
    private VenteRepository venteRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private InvestissementRepository investissementRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            long totalSales = venteRepository.count();
            long totalProducts = produitRepository.count();
            long totalClients = clientRepository.count();
            long totalEmployees = employeRepository.count();
            long totalInvestments = investissementRepository.count();
            
            // Calcul du revenu total (somme de quantité * prix des produits)
            Double totalRevenue = venteRepository.findAll().stream()
                .mapToDouble(vente -> {
                    if (vente.getProduit() != null && vente.getProduit().getPrix() != null && vente.getQuantite() != null) {
                        return vente.getProduit().getPrix() * vente.getQuantite();
                    }
                    return 0.0;
                })
                .sum();
            
            stats.put("totalSales", totalSales);
            stats.put("totalRevenue", totalRevenue);
            stats.put("totalProducts", totalProducts);
            stats.put("totalClients", totalClients);
            stats.put("totalEmployees", totalEmployees);
            stats.put("totalInvestments", totalInvestments);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            stats.put("error", "Erreur lors de la récupération des statistiques: " + e.getMessage());
            return ResponseEntity.internalServerError().body(stats);
        }
    }
}
