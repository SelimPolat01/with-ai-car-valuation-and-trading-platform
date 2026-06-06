import os
import hashlib

def kopya_resimleri_sil(klasor_yolu):
    gorulen_boyutlar = {}
    silinen_sayisi = 0

    print("Tarama işlemi başlatıldı...\n")

    for kök_dizin, alt_klasorler, dosyalar in os.walk(klasor_yolu):
        for dosya in dosyalar:
            if dosya.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp')):
                dosya_yolu = os.path.join(kök_dizin, dosya)
                
                try:
                    dosya_boyutu = os.path.getsize(dosya_yolu)
                    if dosya_boyutu in gorulen_boyutlar:
                        with open(dosya_yolu, 'rb') as f:
                            mevcut_hash = hashlib.md5(f.read()).hexdigest()
                        
                        ilk_dosya_yolu = gorulen_boyutlar[dosya_boyutu]
                        with open(ilk_dosya_yolu, 'rb') as f:
                            ilk_hash = hashlib.md5(f.read()).hexdigest()
                        
                        if mevcut_hash == ilk_hash:
                            print(f"Siliniyor (Kopya): {dosya_yolu}")
                            os.remove(dosya_yolu)
                            silinen_sayisi += 1
                    else:
                        gorulen_boyutlar[dosya_boyutu] = dosya_yolu
                        
                except Exception as e:
                    print(f"Hata oluştu ({dosya}): {e}")

    print("-" * 40)
    print(f"İşlem tamamlandı! Toplam {silinen_sayisi} adet kopya resim silindi.")

dataset_path = r"../"
kopya_resimleri_sil(dataset_path)