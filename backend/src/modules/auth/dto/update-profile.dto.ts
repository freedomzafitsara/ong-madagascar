import { IsString, IsOptional, IsUrl, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'Le prenom doit être une chaîne de caracteres' })
  @IsOptional()
  firstName?: string;

  @IsString({ message: 'Le nom doit être une chaîne de caracteres' })
  @IsOptional()
  lastName?: string;

  @IsString({ message: 'Le telephone doit être une chaîne de caracteres' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'La region doit être une chaîne de caracteres' })
  @IsOptional()
  region?: string;

  @IsString({ message: 'La biographie doit être une chaîne de caracteres' })
  @IsOptional()
  bio?: string;

  @IsString({ message: 'Le poste doit être une chaîne de caracteres' })
  @IsOptional()
  position?: string;

  @IsString({ message: 'Le département doit être une chaîne de caracteres' })
  @IsOptional()
  department?: string;

  @IsString({ message: 'Les compétences doivent être une chaîne de caracteres' })
  @IsOptional()
  skills?: string;

  @IsUrl({}, { message: 'Le lien LinkedIn doit être une URL valide' })
  @IsOptional()
  socialLinkedin?: string;

  @IsUrl({}, { message: 'Le lien Twitter doit être une URL valide' })
  @IsOptional()
  socialTwitter?: string;

  @IsUrl({}, { message: 'Le lien GitHub doit être une URL valide' })
  @IsOptional()
  socialGithub?: string;

  @IsString({ message: 'L URL de l avatar doit être une chaîne de caracteres' })
  @IsOptional()
  avatar_url?: string;
}