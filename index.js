// pages/index.js
import { useState, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [originalImage, setOriginalImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (file) => {
    if (!file.type.match('image.*')) {
      alert('Silakan unggah file gambar (JPG, PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage({
        src: e.target.result,
        file: file,
      });
    };
    reader.readAsDataURL(file);
  };

  const applyAIEnhancement = () => {
    if (!originalImage) {
      alert('Silakan unggah foto terlebih dahulu');
      return;
    }

    // Simulate AI enhancement process
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = originalImage.src;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Apply your AI enhancement algorithms here
        // For demonstration, we just resize the image
        const enhancedSrc = canvas.toDataURL('image/jpeg', 0.95);
        setEnhancedImage({ src: enhancedSrc, file: originalImage.file });
      };
    }, 2500);
  };

  const downloadImage = () => {
    if (!enhancedImage) {
      alert('Tidak ada gambar untuk diunduh');
      return;
    }

    const link = document.createElement('a');
    link.download = 'foto-dijernihkan-ai.jpg';
    link.href = enhancedImage.src;
    link.click();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>PhotoAI - Penjernih Foto Canggih</title>
        <meta name="description" content="Seperti Remini, tingkatkan kualitas foto buram Anda menjadi gambar tajam dan jelas dalam hitungan detik" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Jernihkan Foto dengan Teknologi AI</h1>
        <p className={styles.description}>Seperti Remini, tingkatkan kualitas foto buram Anda menjadi gambar tajam dan jelas dalam hitungan detik</p>
        <div className={styles.grid}>
          <a href="#upload" className={styles.btn}>
            Mulai Sekarang
          </a>
        </div>

        <section id="upload" className={styles.uploadSection}>
          <h2>Unggah Foto yang Ingin Dijernihkan</h2>
          <div
            className={styles.uploadArea}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => {}}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
          >
            <div className={styles.uploadIcon}>⇑</div>
            <div className={styles.uploadText}>Klik untuk mengunggah foto atau seret dan lepas di sini</div>
            <div className={styles.uploadHint}>Format yang didukung: JPG, PNG (Maks. 10MB)</div>
          </div>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0])} />
        </section>

        {originalImage && (
          <section className={styles.previewSection}>
            <h2>Hasil Penjernihan AI</h2>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <div className={styles.loadingText}>AI sedang menjernihkan gambar...</div>
            </div>
            <div className={styles.previewContainer}>
              <div className={styles.previewBox}>
                <div className={styles.previewLabel}>Foto Asli</div>
                <img src={originalImage.src} alt="Foto Asli" className={styles.previewImage} />
              </div>
              <div className={styles.previewBox}>
                <div className={styles.previewLabel}>Hasil AI</div>
                <img src={enhancedImage ? enhancedImage.src : originalImage.src} alt="Foto Dijernihkan" className={styles.previewImage} />
              </div>
            </div>
            <div className={styles.actionButtons}>
              <button onClick={applyAIEnhancement} className={styles.btn}>
                Jernihkan dengan AI
              </button>
              {enhancedImage && (
                <button onClick={downloadImage} className={styles.btn}>
                  Unduh Foto
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.globeIcon} />
        <div className={styles.footerText}>PhotoAI - Penjernih Foto.</div>
      </footer>
    </div>
  );
}
