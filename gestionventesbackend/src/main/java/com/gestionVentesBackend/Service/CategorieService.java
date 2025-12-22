package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Categorie;
import com.gestionVentesBackend.Repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Catégories
 */
@Service
public class CategorieService {

    @Autowired
    private CategorieRepository categorieRepository;

    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

    public Optional<Categorie> getCategorieById(Integer id) {
        return categorieRepository.findById(id);
    }

    public Categorie createCategorie(Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    public Categorie updateCategorie(Integer id, Categorie categorieDetails) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        
        if (categorieDetails.getNom() != null) categorie.setNom(categorieDetails.getNom());
        if (categorieDetails.getDescription() != null) categorie.setDescription(categorieDetails.getDescription());
        
        return categorieRepository.save(categorie);
    }

    public void deleteCategorie(Integer id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + id));
        
        // Vérifier s'il y a des investissements associés
        if (categorie.getInvestissements() != null && !categorie.getInvestissements().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer cette catégorie car elle a " + 
                categorie.getInvestissements().size() + " investissement(s) associé(s). " +
                "Veuillez d'abord supprimer les investissements.");
        }
        
        categorieRepository.delete(categorie);
    }
}
