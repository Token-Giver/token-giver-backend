import { Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from './models/category.model';

@Resolver(() => Category)
export class CategoryResolver {
  private readonly logger = new Logger(CategoryResolver.name);

  constructor(private prismaService: PrismaService) {}

  /**
   * Create a new category
   * @param name The name of the category
   * @returns The created category
   */
  @Mutation(() => Category)
  async createCategory(@Args('name') name: string): Promise<Category> {
    try {
      return await this.prismaService.category.create({
        data: { name },
      });
    } catch (error) {
      this.logger.error('Failed to create category', error.stack);
      throw new Error(
        'An error occurred while creating the category. Please try again later.',
      );
    }
  }

  /**
   * Get all categories with pagination
   * @param cursor Optional cursor for pagination
   * @param limit Maximum number of items to return
   * @returns A list of categories and pagination info
   */
  @Query(() => [Category])
  async getAllCategories(
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit?: number,
  ): Promise<Category[]> {
    try {
      return await this.prismaService.category.findMany({
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: parseInt(cursor) } : undefined,
        orderBy: {
          id: 'desc',
        },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve categories', error.stack);
      throw new Error('Unable to retrieve categories. Please try again later.');
    }
  }

  /**
   * Get a category by ID
   * @param id The ID of the category
   * @returns The category if found
   */
  @Query(() => Category, { nullable: true })
  async getCategoryById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Category | null> {
    if (typeof id !== 'number') {
      throw new BadRequestException('Invalid category ID format');
    }

    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Update a category
   * @param id The ID of the category to update
   * @param name The new name for the category
   * @returns The updated category
   */
  @Mutation(() => Category)
  async updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('name') name: string,
  ): Promise<Category> {
    try {
      const category = await this.prismaService.category.update({
        where: { id },
        data: { name },
      });
      return category;
    } catch (error) {
      this.logger.error('Failed to update category', error.stack);
      throw new Error(
        'An error occurred while updating the category. Please try again later.',
      );
    }
  }

  /**
   * Delete a category
   * @param id The ID of the category to delete
   * @returns The deleted category
   */
  @Mutation(() => Category)
  async deleteCategory(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Category> {
    try {
      const category = await this.prismaService.category.delete({
        where: { id },
      });
      return category;
    } catch (error) {
      this.logger.error('Failed to delete category', error.stack);
      throw new Error(
        'An error occurred while deleting the category. Please try again later.',
      );
    }
  }
}
