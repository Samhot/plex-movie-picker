import { PrismaHistoryRepository } from '@beeldi-app/history/repos/prisma';
import {
  IExecutionContextStorage,
  generateCuid,
  generateFakeFirebaseKey,
} from '@beeldi-app/shared/utils';
import {
  FirebaseClient,
  FirebaseDatabaseClient,
} from '@beeldi-app/shared/clients/firebase';
import { FirebaseRegulatoryThemesRepository } from '@beeldi-app/regulatory/repos/firebase';
import 'jest-extended';
import {
  createPeriodicVisits,
  createRegulatoryObligations,
  createTemporaryReports,
} from '@beeldi-app/shared/prisma-seed';
import { prismaTemporaryRegulatoryReportToDomainMapper } from './prismaRegulatoryReportToDomainMapper';
import { RegulatoryReportStatus } from '@prisma/client';
import { PrismaBuildingRepository } from '@beeldi-app/assets/repos/prisma';
import { FirebaseBuildingRepository } from '@beeldi-app/assets/repos/firebase';
import {
  PERIODIC_VISITS_FREQUENCIES,
  PeriodicVisitFrequencyType,
  computeRegulatoryReportValidUntil,
} from '@beeldi-app/regulatory/core';
import { faker } from '@faker-js/faker';
import { PostgresMovieRepository } from './PostgresMovieRepository';
import { PrismaService } from '@beeldi-app/shared/clients/prisma';

describe('PostgresRegulatoryrepository', () => {
  const prisma = new PrismaService();
  const firebase = new FirebaseClient();
  const firebaseDb = new FirebaseDatabaseClient(firebase);
  const themesRepository = new FirebaseRegulatoryThemesRepository(firebaseDb);
  const historyRepository = new PrismaHistoryRepository(
    prisma,
    {} as IExecutionContextStorage
  );
  const firebaseBuildingRepository = new FirebaseBuildingRepository(firebaseDb);
  const buildingRepository = new PrismaBuildingRepository(
    prisma,
    firebaseBuildingRepository
  );
  const repository = new PostgresMovieRepository(
    prisma,
    historyRepository,
    themesRepository,
    buildingRepository
  );

  const parkKey = generateFakeFirebaseKey();

  const populateRegulatoryReport = async (
    realVisitDate: Date = faker.date.past(),
    frequency?: PeriodicVisitFrequencyType
  ) => {
    const [obligation] = await createRegulatoryObligations(
      prisma,
      firebaseDb,
      { frequency: frequency?.id },
      parkKey,
      1
    );
    const [periodicVisit] = await createPeriodicVisits(prisma, {
      obligations: [obligation],
      realVisitDate,
      count: 1,
    });

    return repository.createReport({
      documentId: generateCuid(),
      periodicVisitsIds: [periodicVisit.id],
      archived: faker.datatype.boolean(),
    });
  };

  describe('getTemporaryRegulatoryReportsByParks', () => {
    it('should return temporary regulatory reports of multiple parks', async () => {
      // Arrange
      const parksIds = [generateFakeFirebaseKey(), generateFakeFirebaseKey()];
      const themes = await themesRepository.getRegulatoryThemes();
      const createdReports = (
        await Promise.all([
          createTemporaryReports(prisma, firebaseDb, 2, {
            parkKey: parksIds[0],
          }),
          createTemporaryReports(prisma, firebaseDb, 2, {
            parkKey: parksIds[1],
          }),
        ])
      ).flat();
      const buildings = await prisma.building.findMany();
      const genericObligations =
        await prisma.genericRegulatoryObligation.findMany();

      // Act
      const reports = await repository.getTemporaryRegulatoryReportsByParks(
        parksIds
      );

      // Assert
      expect(reports).toHaveLength(4);
      expect(reports).toIncludeSameMembers(
        createdReports.map((report) =>
          expect.objectContaining({
            ...prismaTemporaryRegulatoryReportToDomainMapper(report),
            id: report.id,
            parkId: report.parkFirebaseKey,
            themeAcronym: themes.find(
              (theme) => theme.themeId === report.themeId
            )?.acronym,
            buildingsIds: report.buildingsIds.map(
              (building) => building.buildingId
            ),
            buildingsNames: report.buildingsIds.map(
              (building) =>
                buildings.find(
                  (b) =>
                    b.id === building.buildingId ||
                    b.firebaseId === building.buildingId
                )?.name
            ),
            obligationName: genericObligations.find(
              (obligation) =>
                obligation.id === report.obligationId ||
                obligation.firebaseKey === report.obligationId
            )?.name,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        )
      );
    });

    it('should return temporary regulatory reports of multiple parks with filter on createdAt', async () => {
      // Arrange
      const parksIds = [generateFakeFirebaseKey(), generateFakeFirebaseKey()];
      const createdReports = (
        await Promise.all([
          createTemporaryReports(prisma, firebaseDb, 2, {
            parkKey: parksIds[0],
            customCreatedAt: new Date(2021, 0, 16),
          }),
          createTemporaryReports(prisma, firebaseDb, 2, {
            parkKey: parksIds[1],
            customCreatedAt: new Date(2021, 1, 1),
          }),
        ])
      ).flat();

      // Act
      const reports = await repository.getTemporaryRegulatoryReportsByParks(
        parksIds,
        {
          createdAt: {
            from: new Date(2021, 0, 15),
            to: new Date(2021, 0, 21),
          },
        }
      );

      // Assert
      expect(reports).toHaveLength(2);
      expect(reports).toIncludeSameMembers(
        createdReports.slice(0, 2).map((report) =>
          expect.objectContaining({
            id: report.id,
          })
        )
      );
    });

    it('should return temporary regulatory reports of multiple parks with filter on status', async () => {
      // Arrange
      const parksIds = [generateFakeFirebaseKey(), generateFakeFirebaseKey()];
      const createdReports = (
        await Promise.all([
          createTemporaryReports(prisma, firebaseDb, 1, {
            parkKey: parksIds[0],
            forcedStatus: RegulatoryReportStatus.BLOCKED,
          }),
          createTemporaryReports(prisma, firebaseDb, 1, {
            parkKey: parksIds[1],
            forcedStatus: RegulatoryReportStatus.PENDING,
          }),
          createTemporaryReports(prisma, firebaseDb, 1, {
            parkKey: parksIds[1],
            forcedStatus: RegulatoryReportStatus.PROCESSED,
          }),
        ])
      ).flat();

      // Act
      const reports = await repository.getTemporaryRegulatoryReportsByParks(
        parksIds,
        {
          status: [
            RegulatoryReportStatus.BLOCKED,
            RegulatoryReportStatus.PENDING,
          ],
        }
      );

      // Assert
      expect(reports).toHaveLength(2);
      expect(reports).toIncludeSameMembers(
        createdReports.slice(0, 2).map((report) =>
          expect.objectContaining({
            id: report.id,
          })
        )
      );
    });

    it('should sync buildings if not exist in postgres', async () => {
      // Arrange
      const parksIds = [generateFakeFirebaseKey(), generateFakeFirebaseKey()];
      const createdReports = await createTemporaryReports(
        prisma,
        firebaseDb,
        1,
        {
          parkKey: parksIds[0],
          forcedStatus: RegulatoryReportStatus.PENDING,
          createAssetsInFirebase: true,
        }
      );

      // Act
      const reports = await repository.getTemporaryRegulatoryReportsByParks(
        parksIds,
        {
          status: [RegulatoryReportStatus.PENDING],
        }
      );

      // Assert
      const buildingInPostgres = await prisma.building.findFirst({
        where: {
          firebaseId: createdReports[0].buildingsIds[0].buildingId,
        },
      });

      expect(reports).toEqual([
        expect.objectContaining({
          id: createdReports[0].id,
          buildingsIds: createdReports[0].buildingsIds.map(
            (building) => building.buildingId
          ),
          buildingsNames: [buildingInPostgres?.name],
        }),
      ]);
    });
  });

  describe('validUntil', () => {
    const realVisitDate = new Date('2023-01-01');

    PERIODIC_VISITS_FREQUENCIES.forEach((frequency) => {
      it(`should correctly compute the validUntil date considering obligation frequency ${frequency.id}`, async () => {
        // Arrange
        const createdReport = await populateRegulatoryReport(
          realVisitDate,
          frequency
        );

        // Act
        const report = await prisma.regulatoryReport.findUnique({
          where: {
            id: createdReport.id,
          },
          include: {
            validUntil: true,
          },
        });

        // Assert
        const coreReport = (await repository.getOne(createdReport.id))!;
        const coreValidUntil = computeRegulatoryReportValidUntil({
          ...coreReport,
          obligations: [coreReport.obligations[0]],
        });

        expect(report?.validUntil?.validUntil).toEqual(coreValidUntil);
      });
    });

    it(`should give priority to smallest frequnecy`, async () => {
      // Arrange
      const [obligation] = await createRegulatoryObligations(
        prisma,
        firebaseDb,
        { frequency: PERIODIC_VISITS_FREQUENCIES[0].id },
        parkKey,
        1
      );
      const [periodicVisit] = await createPeriodicVisits(prisma, {
        obligations: [obligation],
        realVisitDate,
        count: 1,
      });
      const [obligation2] = await createRegulatoryObligations(
        prisma,
        firebaseDb,
        { frequency: PERIODIC_VISITS_FREQUENCIES[1].id },
        parkKey,
        1
      );
      const [periodicVisit2] = await createPeriodicVisits(prisma, {
        obligations: [obligation2],
        realVisitDate,
        count: 1,
      });
      const createdReport = await repository.createReport({
        documentId: generateCuid(),
        periodicVisitsIds: [periodicVisit.id, periodicVisit2.id],
      });

      // Act
      const report = await prisma.regulatoryReport.findUnique({
        where: {
          id: createdReport.id,
        },
        include: {
          validUntil: true,
        },
      });

      // Assert
      const coreValidUntil = computeRegulatoryReportValidUntil(
        (await repository.getOne(createdReport.id))!
      );

      expect(report?.validUntil?.validUntil).toEqual(coreValidUntil);
    });
  });

  describe('updateRegulatoryReport', () => {
    it('should update regulatory report', async () => {
      // Arrange
      const createdReport = await populateRegulatoryReport();
      const input = {
        id: createdReport.id,
        archived: !createdReport.archived,
      };

      // Act
      const updatedReport = await repository.updateRegulatoryReport(input);

      // Assert
      expect(updatedReport).toMatchObject(input);

      expect(
        await prisma.regulatoryReport.findUnique({
          where: { id: createdReport.id },
        })
      ).toMatchObject(input);
    });
  });
});
