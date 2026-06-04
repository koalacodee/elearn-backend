import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserRole } from '../../auth/domain/user-role.enum';
import { Role } from '../../auth/interface/decorators/role.decorator';
import { CreateWordUseCase } from '../application/create-word.use-case';
import { DeleteWordUseCase } from '../application/delete-word.use-case';
import {
  ExportFormat,
  ExportWordsUseCase,
} from '../application/export-words.use-case';
import {
  ImportFormat,
  ImportWordsUseCase,
} from '../application/import-words.use-case';
import { ListWordsUseCase } from '../application/list-words.use-case';
import { UpdateWordUseCase } from '../application/update-word.use-case';
import { CreateWordDto } from './dtos/create-word.dto';
import { UpdateWordDto } from './dtos/update-word.dto';

function assertFormat(value: string | undefined): ImportFormat {
  if (value !== 'json' && value !== 'csv') {
    throw new BadRequestException('format must be "json" or "csv"');
  }
  return value;
}

function assertExportFormat(value: string | undefined): ExportFormat {
  if (value !== 'json' && value !== 'csv') {
    throw new BadRequestException('format must be "json" or "csv"');
  }
  return value;
}

@Role([UserRole.ADMIN])
@Controller()
export class AdminWordsController {
  constructor(
    private readonly createWord: CreateWordUseCase,
    private readonly updateWord: UpdateWordUseCase,
    private readonly deleteWord: DeleteWordUseCase,
    private readonly listWords: ListWordsUseCase,
    private readonly importWords: ImportWordsUseCase,
    private readonly exportWords: ExportWordsUseCase,
  ) {}

  @Get('admin/units/:unitId/words')
  list(@Param('unitId', ParseUUIDPipe) unitId: string) {
    return this.listWords.executeForAdmin(unitId);
  }

  @Post('admin/words')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateWordDto) {
    return this.createWord.execute(dto);
  }

  @Patch('admin/words/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWordDto) {
    return this.updateWord.execute(id, dto);
  }

  @Delete('admin/words/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteWord.execute(id);
  }

  @Post('admin/units/:unitId/words/import')
  @HttpCode(HttpStatus.CREATED)
  async import(
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Query('format') formatRaw: string | undefined,
    @Req() req: FastifyRequest,
  ) {
    const format = assertFormat(formatRaw);
    const body = await this.readImportBody(req, format);
    const inserted = await this.importWords.execute({ unitId, format, body });
    return { imported: inserted.length, words: inserted };
  }

  @Get('admin/units/:unitId/words/export')
  async export(
    @Param('unitId', ParseUUIDPipe) unitId: string,
    @Query('format') formatRaw: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const format = assertExportFormat(formatRaw);
    const { contentType, filename, body } = await this.exportWords.execute(
      unitId,
      format,
    );
    reply.header('Content-Type', contentType);
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    return body;
  }

  private async readImportBody(
    req: FastifyRequest,
    format: ImportFormat,
  ): Promise<string> {
    if (req.isMultipart()) {
      const file = await req.file();
      if (!file) throw new BadRequestException('missing_file');
      const buf = await file.toBuffer();
      return buf.toString('utf8');
    }
    if (format === 'json') {
      if (!req.body) throw new BadRequestException('missing_body');
      return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
    throw new BadRequestException('csv_import_requires_multipart_file');
  }
}
