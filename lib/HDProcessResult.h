#pragma once

#include "Precision.h"
#include "Linalg.h"
#include <vector>


 /**
  * All output data generated from the HDProcessor. 
  */
struct HDProcessResult {
  
  FortranLinalg::DenseVector<Precision> scaledPersistence; // Persistence.data.hdr
  FortranLinalg::DenseVector<Precision> minLevel;          // PersistenceStart.data.hdr
  FortranLinalg::DenseMatrix<Precision> X;                 // Geom.data.hdr
  FortranLinalg::DenseVector<Precision> Y;                 // Function.data.hdr

  // loadData
  std::vector<FortranLinalg::DenseMatrix<int>> crystals;            // Crystals_[level].dat.hdr
  std::vector<FortranLinalg::DenseVector<Precision>> extremaWidths; // ExtremaWidths_[level].data.hdr
  
  
    
  // loadLayouts
  // Lmin     IsoMin.data.hdr
  // Lmax     IsoMax.data.hdr
  // L[i] =   ps_[level]_crystal_[i]_isolayout.data.hdr
  //          IsoExtremaLayout_[level].data.hdr
  // Lmin     PCAMin.data.hdr
  // Lmax     PCAMax.data.hdr
  // L[i] =   ps_[level]_crystal_[i]_layout.data.hdr
  //          ExtremaLayout_[level].data.hdr
  //          ExtremaValues_[level].data.hdr
  // Lmin     PCA2Min.data.hdr
  // Lmin     PCA2Max.data.hdr
  // L[i] =   ps_[level]_crystal_[i]_pca2layout.data.hdr
  //          PCA2ExtremaLayout_[level].data.hdr
    
        
  // loadColorValues    
  std::vector<std::vector<FortranLinalg::DenseVector<Precision>>> fmean;  // ps_[level]_crystal_[i]_fmean.data.hdr
  // loadWidthValues    
  std::vector<std::vector<FortranLinalg::DenseVector<Precision>>> mdists; // ps_[level]_crystal_[i]_mdists.data.hdr
  // loadDensityValues  
  std::vector<std::vector<FortranLinalg::DenseVector<Precision>>> spdf;   // ps_[level]_crystal_[i]_spdf.data.hdr

  // Reconstructions 
  std::vector<std::vector<FortranLinalg::DenseMatrix<Precision>>> R;     // ps_[level]_crystal_[i]_Rs.data.hdr"; CrystalIds
  std::vector<std::vector<FortranLinalg::DenseMatrix<Precision>>> gradR; // ps_[level]_crystal_[i]_gradRs.data.hdr";
  std::vector<std::vector<FortranLinalg::DenseMatrix<Precision>>> Rvar;  // ps_[level]_crystal_[i]_Svar.data.hdr"; 
};