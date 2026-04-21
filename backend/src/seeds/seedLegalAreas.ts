import LegalArea from '../models/LegalArea';
import CaseType from '../models/CaseType';

const seedLegalAreasAndCaseTypes = async () => {
  try {
    // Sync only LegalArea and CaseType tables
    await LegalArea.sync({ alter: false });
    await CaseType.sync({ alter: false });

    // Clear existing data
    await CaseType.destroy({ where: {} });
    await LegalArea.destroy({ where: {} });

    // Create Legal Areas
    const familyArea = await LegalArea.create({
      name: 'Direito de Família',
      description: 'Ações relacionadas a família, casamento, divórcio, guarda e alimentos',
    });

    const laborArea = await LegalArea.create({
      name: 'Direito Trabalhista',
      description: 'Ações trabalhistas, rescisão, diferenças salariais',
    });

    const civilArea = await LegalArea.create({
      name: 'Direito Civil',
      description: 'Contratos, responsabilidade civil, indenizações',
    });

    const taxArea = await LegalArea.create({
      name: 'Direito Tributário',
      description: 'Questões de impostos, taxas e contribuições',
    });

    const adminArea = await LegalArea.create({
      name: 'Direito Administrativo',
      description: 'Ações contra administração pública',
    });

    // Create Case Types for each Legal Area
    await CaseType.create({
      legalAreaId: familyArea.id,
      name: 'Divórcio',
      description: 'Ação de dissolução de vínculo matrimonial',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: familyArea.id,
      name: 'Guarda de Menor',
      description: 'Disputa pela guarda de filhos',
      requiresDependents: true,
    });

    await CaseType.create({
      legalAreaId: familyArea.id,
      name: 'Ação de Alimentos',
      description: 'Cobrar pensão alimentícia',
      requiresDependents: true,
    });

    await CaseType.create({
      legalAreaId: laborArea.id,
      name: 'Rescisão Contratual',
      description: 'Ação por rescisão injustificada',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: laborArea.id,
      name: 'Diferenças Salariais',
      description: 'Cobrança de diferenças salariais não pagas',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: laborArea.id,
      name: 'Horas Extras',
      description: 'Cobrança de horas extraordinárias',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: civilArea.id,
      name: 'Cobrança de Débito',
      description: 'Ação para cobrança de débitos civis',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: civilArea.id,
      name: 'Indenização por Dano Moral',
      description: 'Ação por danos morais',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: civilArea.id,
      name: 'Disputa de Herança',
      description: 'Ação relacionada a herança e sucessão',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: taxArea.id,
      name: 'Embargos à Execução Fiscal',
      description: 'Embargo contra execução fiscal',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: taxArea.id,
      name: 'Restituição de Tributos',
      description: 'Ação para restituição de tributos pagos indevidamente',
      requiresDependents: false,
    });

    await CaseType.create({
      legalAreaId: adminArea.id,
      name: 'Mandado de Segurança',
      description: 'Ação para proteger direito líquido e certo contra ato ilegal',
      requiresDependents: false,
    });

    console.log('✅ Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedLegalAreasAndCaseTypes();
