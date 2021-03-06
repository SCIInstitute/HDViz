#include "gtest/gtest.h"
#include "DatasetLoader.h"
#include "Dataset.h"

const std::string kExampleDirPath = std::string(EXAMPLE_DATA_DIR);   

//---------------------------------------------------------------------
// Tests
//---------------------------------------------------------------------

TEST(DatasetLoader, loadDataset_linalg) {  
  std::string filePath = kExampleDirPath + "_no_load/gaussian2d/config.yaml";
  std::unique_ptr<dspacex::Dataset> dataset = dspacex::DatasetLoader::loadDataset(filePath);
}

TEST(DatasetLoader, loadDataset_csv) {
  std::string filePath = kExampleDirPath + "/cantilever_beam/config.yaml";
  std::unique_ptr<dspacex::Dataset> dataset = dspacex::DatasetLoader::loadDataset(filePath);
}
