package org.isaac.techinventoryservice.application.port.output;

import org.isaac.techinventoryservice.domain.model.Asset;

import java.util.List;

public interface ReportGeneratorPort {
    String generateAssetReport(List<Asset> assets, String username);
}
