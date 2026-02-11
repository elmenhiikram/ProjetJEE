#!/usr/bin/env python3
"""
Script pour générer des hashes BCrypt pour les mots de passe
Usage: python generate_bcrypt_hash.py
"""

try:
    import bcrypt
except ImportError:
    print("Installation de bcrypt...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'bcrypt'])
    import bcrypt

def generate_bcrypt_hash(password):
    """Génère un hash BCrypt pour un mot de passe"""
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_hash(password, hashed):
    """Vérifie si un mot de passe correspond à un hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

if __name__ == "__main__":
    # Mot de passe à hasher
    password = "password123"
    
    print("=" * 60)
    print("GÉNÉRATION DE HASHES BCRYPT")
    print("=" * 60)
    print(f"\nMot de passe: {password}")
    print("\n" + "-" * 60)
    
    # Générer le hash
    hash1 = generate_bcrypt_hash(password)
    print(f"\nHash BCrypt généré:")
    print(f"{hash1}")
    
    # Vérification
    print("\n" + "-" * 60)
    print("Vérification du hash...")
    if verify_hash(password, hash1):
        print("✓ Hash vérifié avec succès!")
    else:
        print("✗ Erreur de vérification")
    
    # Générer plusieurs hashes pour différents utilisateurs
    print("\n" + "=" * 60)
    print("HASHES POUR TOUS LES UTILISATEURS")
    print("=" * 60)
    
    users = [
        ("Admin", "admin@gestionventes.com"),
        ("Analyste", "analyste@gestionventes.com"),
        ("Investisseur", "investisseur@gestionventes.com"),
        ("Vendeur", "vendeur@gestionventes.com"),
        ("Client", "client@gestionventes.com")
    ]
    
    for role, email in users:
        user_hash = generate_bcrypt_hash(password)
        print(f"\n{role} ({email}):")
        print(f"Hash: {user_hash}")
    
    print("\n" + "=" * 60)
    print("Script terminé!")
    print("=" * 60)
