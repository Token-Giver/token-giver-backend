import { Test, TestingModule } from '@nestjs/testing';
import { CategoryResolver } from './category.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoryResolver', () => {
  let resolver: CategoryResolver;
  let prismaService: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryResolver,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    resolver = module.get<CategoryResolver>(CategoryResolver);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createCategory', () => {
    it('should successfully create a category', async () => {
      const categoryData = { name: 'Test Category' };
      const expectedCategory = {
        id: 1,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      prismaService.category.create.mockResolvedValue(expectedCategory);

      const result = await resolver.createCategory(categoryData.name);

      expect(result).toEqual(expectedCategory);
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: { name: categoryData.name },
      });
    });

    it('should handle database errors when creating category', async () => {
      prismaService.category.create.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(resolver.createCategory('Test Category')).rejects.toThrow(
        'An error occurred while creating the category. Please try again later.',
      );
    });
  });

  describe('getAllCategories', () => {
    it('should return categories with default pagination', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Category 1',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Category 2',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      prismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await resolver.getAllCategories();

      expect(result).toEqual(mockCategories);
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        cursor: undefined,
        orderBy: { id: 'desc' },
      });
    });

    it('should return categories with custom pagination', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Category 1',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Category 2',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      prismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await resolver.getAllCategories('1', 5);

      expect(result).toEqual(mockCategories);
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        take: 5,
        skip: 1,
        cursor: { id: 1 },
        orderBy: { id: 'desc' },
      });
    });

    it('should handle database errors when fetching categories', async () => {
      prismaService.category.findMany.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(resolver.getAllCategories()).rejects.toThrow(
        'Unable to retrieve categories. Please try again later.',
      );
    });
  });

  describe('getCategoryById', () => {
    it('should return a category when found', async () => {
      const mockCategory = {
        id: 1,
        name: 'Test Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      prismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await resolver.getCategoryById(1);

      expect(result).toEqual(mockCategory);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      prismaService.category.findUnique.mockResolvedValue(null);

      await expect(resolver.getCategoryById(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid ID format', async () => {
      await expect(resolver.getCategoryById('invalid' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle database errors when fetching category', async () => {
      prismaService.category.findUnique.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(resolver.getCategoryById(1)).rejects.toThrow(
        'Unable to retrieve categories. Please try again later.',
      );
    });
  });

  describe('updateCategory', () => {
    it('should successfully update a category', async () => {
      const mockCategory = {
        id: 1,
        name: 'Updated Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      prismaService.category.update.mockResolvedValue(mockCategory);

      const result = await resolver.updateCategory(1, 'Updated Category');

      expect(result).toEqual(mockCategory);
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Category' },
      });
    });

    it('should handle database errors when updating category', async () => {
      prismaService.category.update.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        resolver.updateCategory(1, 'Updated Category'),
      ).rejects.toThrow(
        'An error occurred while updating the category. Please try again later.',
      );
    });
  });

  describe('deleteCategory', () => {
    it('should successfully delete a category', async () => {
      const mockCategory = {
        id: 1,
        name: 'Deleted Category',
        created_at: new Date(),
        updated_at: new Date(),
      };

      prismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await resolver.deleteCategory(1);

      expect(result).toEqual(mockCategory);
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should handle database errors when deleting category', async () => {
      prismaService.category.delete.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(resolver.deleteCategory(1)).rejects.toThrow(
        'An error occurred while deleting the category. Please try again later.',
      );
    });
  });
});
