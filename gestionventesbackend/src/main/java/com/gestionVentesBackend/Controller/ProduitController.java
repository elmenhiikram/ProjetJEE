package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Produit;
import com.gestionVentesBackend.Model.Categorie;
import com.gestionVentesBackend.Repository.ProduitRepository;
import com.gestionVentesBackend.Repository.CategorieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produits")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:4200"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowedHeaders = "*",
        allowCredentials = "true",
        maxAge = 3600
)
public class ProduitController {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;

    public ProduitController(ProduitRepository produitRepository, CategorieRepository categorieRepository) {
        this.produitRepository = produitRepository;
        this.categorieRepository = categorieRepository;
    }

    // GET /produits - Récupérer tous les produits
    @GetMapping
    public ResponseEntity<List<Produit>> getProduits() {
        try {
            System.out.println("📥 Récupération de tous les produits");
            List<Produit> produits = produitRepository.findAll();
            System.out.println("✅ " + produits.size() + " produits trouvés");
            produits.forEach(p -> System.out.println("  - " + p.getNom() + " (" + p.getPrix() + "€)"));
            return ResponseEntity.ok(produits);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /produits/search?nom=... - Rechercher par nom
    @GetMapping("/search")
    public ResponseEntity<List<Produit>> searchProduits(@RequestParam String nom) {
        try {
            System.out.println("🔍 Recherche de produits avec le terme: " + nom);
            List<Produit> produits = produitRepository.findByNomContainingIgnoreCase(nom);
            System.out.println("✅ " + produits.size() + " produits trouvés pour la recherche");
            return ResponseEntity.ok(produits);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la recherche: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /produits/{id} - Récupérer un produit par ID
    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Integer id) {
        try {
            System.out.println("📥 Récupération du produit ID: " + id);
            return produitRepository.findById(id)
                    .map(produit -> {
                        System.out.println("✅ Produit trouvé: " + produit.getNom());
                        return ResponseEntity.ok(produit);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // POST /produits - Créer un nouveau produit
    @PostMapping
    public ResponseEntity<?> createProduit(@RequestBody Produit produit) {
        try {
            System.out.println("➕ Création d'un nouveau produit: " + produit.getNom());
            
            // Validation des champs obligatoires
            if (produit.getNom() == null || produit.getNom().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le nom du produit est obligatoire");
            }
            if (produit.getPrix() == null || produit.getPrix() <= 0) {
                return ResponseEntity.badRequest().body("Le prix doit être supérieur à 0");
            }
            if (produit.getQuantite() == null || produit.getQuantite() < 0) {
                return ResponseEntity.badRequest().body("La quantité ne peut pas être négative");
            }
            
            // Si une catégorie est fournie avec un ID, charger la catégorie complète
            if (produit.getCategorie() != null && produit.getCategorie().getId() != null) {
                Categorie categorie = categorieRepository.findById(produit.getCategorie().getId())
                        .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + produit.getCategorie().getId()));
                produit.setCategorie(categorie);
            }
            
            Produit saved = produitRepository.save(produit);
            System.out.println("✅ Produit créé avec l'ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // PUT /produits/{id} - Mettre à jour un produit
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduit(@PathVariable Integer id, @RequestBody Produit produitDetails) {
        try {
            System.out.println("🔄 Mise à jour du produit ID: " + id);
            return produitRepository.findById(id)
                    .map(produit -> {
                        // Validations
                        if (produitDetails.getNom() != null) {
                            if (produitDetails.getNom().trim().isEmpty()) {
                                throw new RuntimeException("Le nom du produit ne peut pas être vide");
                            }
                            produit.setNom(produitDetails.getNom());
                        }
                        if (produitDetails.getPrix() != null) {
                            if (produitDetails.getPrix() <= 0) {
                                throw new RuntimeException("Le prix doit être supérieur à 0");
                            }
                            produit.setPrix(produitDetails.getPrix());
                        }
                        if (produitDetails.getQuantite() != null) {
                            if (produitDetails.getQuantite() < 0) {
                                throw new RuntimeException("La quantité ne peut pas être négative");
                            }
                            produit.setQuantite(produitDetails.getQuantite());
                        }
                        
                        // Autres champs
                        if (produitDetails.getDescription() != null) produit.setDescription(produitDetails.getDescription());
                        if (produitDetails.getImage() != null) produit.setImage(produitDetails.getImage());
                        if (produitDetails.getRank() != null) produit.setRank(produitDetails.getRank());
                        if (produitDetails.getRating() != null) produit.setRating(produitDetails.getRating());
                        if (produitDetails.getReviews_count() != null) produit.setReviews_count(produitDetails.getReviews_count());
                        
                        // Gestion de la catégorie
                        if (produitDetails.getCategorie() != null && produitDetails.getCategorie().getId() != null) {
                            Categorie categorie = categorieRepository.findById(produitDetails.getCategorie().getId())
                                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + produitDetails.getCategorie().getId()));
                            produit.setCategorie(categorie);
                        }

                        Produit updated = produitRepository.save(produit);
                        System.out.println("✅ Produit mis à jour: " + updated.getNom());
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la mise à jour: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // DELETE /produits/{id} - Supprimer un produit
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduit(@PathVariable Integer id) {
        try {
            System.out.println("🗑️ Suppression du produit ID: " + id);
            return produitRepository.findById(id)
                    .map(produit -> {
                        try {
                            produitRepository.delete(produit);
                            System.out.println("✅ Produit supprimé: " + produit.getNom());
                            return ResponseEntity.ok().body("Produit supprimé avec succès");
                        } catch (Exception e) {
                            System.err.println("❌ Erreur lors de la suppression (contrainte FK): " + e.getMessage());
                            return ResponseEntity.badRequest().body("Impossible de supprimer ce produit car il est référencé dans des ventes ou investissements");
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la suppression: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
}