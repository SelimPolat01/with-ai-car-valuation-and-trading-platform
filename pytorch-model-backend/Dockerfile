# Hafif bir Python imajı kullanıyoruz
FROM python:3.10-slim

# Sistem paketlerini güncelleyip temizliyoruz
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face'in zorunlu kıldığı kullanıcı ayarları (User 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Çalışma dizini oluşturma
WORKDIR $HOME/app

# Bağımlılıkları kopyalama ve yükleme
COPY --chown=user:user requirements.txt $HOME/app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Tüm proje dosyalarını (modeller, klasörler dahil) container içine kopyalama
COPY --chown=user:user . $HOME/app

# Hugging Face Spaces sadece 7860 portunu dışarı açar
EXPOSE 7860

# FastAPI uygulamasını başlatma komutu
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]