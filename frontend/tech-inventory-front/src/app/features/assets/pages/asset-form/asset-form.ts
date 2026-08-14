import { Component, computed, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

import { AssetApiService } from '../../../../core/services/asset/asset-api.service';
import { CategoryApiService } from '../../../../core/services/category/category-api.service';
import { CreateAssetRequest } from '../../../../core/models/asset/create-asset-request.model';
import { UpdateAssetRequest } from '../../../../core/models/asset/update-asset-request.model';
import { AssetResponse } from '../../../../core/models/asset/asset-response.model';
import { CategoryResponse } from '../../../../core/models/category/category-response.model';

@Component({
  selector: 'app-asset-form',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatProgressSpinner,
    MatSelect,
    MatOption,
  ],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.scss',
})
export class AssetForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly assetApiService = inject(AssetApiService);
  private readonly categoryApiService = inject(CategoryApiService);

  readonly categories = signal<CategoryResponse[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  private readonly technicalId = signal<string | null>(null);

  readonly isEditMode = computed(() => this.technicalId() !== null);

  readonly assetForm = new FormGroup({
    serialNumber: new FormControl<string>('', Validators.required),
    brand: new FormControl<string>('', Validators.required),
    model: new FormControl<string>('', Validators.required),
    acquisitionCost: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    categoryId: new FormControl<number | null>(null, Validators.required),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('technicalId');
    this.technicalId.set(id ?? null);
    this.loadCategories();

    if (this.isEditMode()) {
      this.loadAsset();
    }
  }

  private loadCategories(): void {
    this.categoryApiService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.errorMessage.set('No se pudieron cargar las categorías.'),
    });
  }

  private loadAsset(): void {
    const id = this.technicalId();
    if (!id) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.assetApiService.getAssetById(id).subscribe({
      next: (asset) => {
        this.assetForm.patchValue({
          serialNumber: asset.serialNumber,
          brand: asset.brand,
          model: asset.model,
          acquisitionCost: asset.acquisitionCost,
          categoryId: asset.category.id,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo cargar el activo.');
      },
    });
  }

  saveAsset(): void {
    this.assetForm.markAllAsTouched();

    if (this.assetForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    if (this.isEditMode()) {
      this.updateAsset();
    } else {
      this.createAsset();
    }
  }

  private createAsset(): void {
    const request: CreateAssetRequest = {
      serialNumber: this.assetForm.value.serialNumber ?? '',
      brand: this.assetForm.value.brand ?? '',
      model: this.assetForm.value.model ?? '',
      acquisitionCost: this.assetForm.value.acquisitionCost ?? 0,
      categoryId: this.assetForm.value.categoryId ?? 0,
    };

    this.assetApiService.createAsset(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/assets']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo crear el activo.');
      },
    });
  }

  private updateAsset(): void {
    const id = this.technicalId();
    if (!id) {
      return;
    }

    const request: UpdateAssetRequest = {
      serialNumber: this.assetForm.value.serialNumber ?? '',
      brand: this.assetForm.value.brand ?? '',
      model: this.assetForm.value.model ?? '',
      acquisitionCost: this.assetForm.value.acquisitionCost ?? 0,
      categoryId: this.assetForm.value.categoryId ?? 0,
    };

    this.assetApiService.updateAsset(id, request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/assets']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo actualizar el activo.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/assets']);
  }
}