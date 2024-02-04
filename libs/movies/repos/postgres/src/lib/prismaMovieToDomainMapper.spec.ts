import { faker } from '@faker-js/faker';
import {
    Organization,
    TemporaryRegulatoryObservation,
    TemporaryRegulatoryReport,
    TemporaryRegulatoryReportBuilding,
} from '@prisma/client';

import { prismaBuildingToDomainMapper } from '@beeldi-app/assets/repos/prisma';
import { elementaryOrganizationMock } from '@beeldi-app/organization/core';
import {
    ElementaryTemporaryRegulatoryReport,
    PeriodicVisitFrequency,
    RegulatoryFieldSource,
    RegulatoryObservationState,
    RegulatoryReportStatus,
} from '@beeldi-app/regulatory/core';
import { ActionPriority } from '@beeldi-app/shared/utils';
import { generateCuid } from '@beeldi-app/shared/utils';

import {
    prismaGenericRegulatoryObligationToDomainMapper,
    prismaRegulatoryObligationToElementaryDomainMapper,
} from '../obligation/prismaRegulatoryObligationToDomainMapper';
import { prismaRegulatoryPeriodicVisitToElementaryDomainMapper } from '../periodicVisit/prismaRegulatoryPeriodicVisitToDomainMapper';
import { prismaVisitMock } from '../periodicVisit/test-utils';

import {
    prismaRegulatoryReportToDomainMapper,
    prismaRegulatoryReportToElementaryDomainMapper,
    prismaTemporaryRegulatoryReportToDomainMapper,
} from './prismaRegulatoryReportToDomainMapper';
import { prismaRegulatoryReportMock } from './test-utils';

describe('prismaRegulatoryReportToDomainMapper', () => {
    it('should map TemporaryRegulatoryReport', () => {
        const baseTemporaryRegulatoryReport = {
            id: 'clda1wszd000008l757fodf7a',
            url: 'https://beeldi.com',
            name: 'name',
            parkId: '01234567890123456789',
            status: RegulatoryReportStatus.PENDING,
            reportIdentifier: 'reportIdentifier',
            obligationId: '01234567890123456789_custom',
            createdBy: 'userUid',
            userInCharge: '01234567890123456789',
            createdAt: new Date(),
            updatedAt: new Date(),
            organizationSource: RegulatoryFieldSource.USER,
            buildingsIdsSource: RegulatoryFieldSource.USER,
            themeIdSource: RegulatoryFieldSource.USER,
            obligationIdSource: RegulatoryFieldSource.USER,
            reportIdentifierSource: RegulatoryFieldSource.USER,
            scanId: faker.database.mongodbObjectId(),
        } satisfies ElementaryTemporaryRegulatoryReport;

        const baseRegulatoryObservation = {
            id: '01234567890123456789/01234567890123456789/01234567890123456789',
            buildingsIds: ['01234567890123456789/01234567890123456789'],
            equipmentId: '01234567890123456789/01234567890123456789/01234567890123456789',
            code: 'code',
            observation: 'observation',
            comment: 'comment',
            identificationDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            state: RegulatoryObservationState.TODO,
            priority: ActionPriority.MEDIUM,
            recommendation: 'recommendation',
            isRecurrent: true,
            source: RegulatoryFieldSource.USER,
            prioritySource: RegulatoryFieldSource.USER,
        };

        const highObservationId = generateCuid();

        const expectedTemporaryRegulatoryReport = {
            ...baseTemporaryRegulatoryReport,
            themeId: '01234567890123456789',
            buildingsIds: [
                {
                    buildingId: '01234567890123456789/01234567890123456789',
                    customFrequency: PeriodicVisitFrequency.Frequency18m,
                },
            ],
            buildingsIdsSource: RegulatoryFieldSource.USER,
            organizationSource: RegulatoryFieldSource.USER,
            reportIdentifierSource: RegulatoryFieldSource.EXTRACTOR,
            themeIdSource: RegulatoryFieldSource.USER,
            obligationIdSource: RegulatoryFieldSource.USER,
            equipmentsIds: [
                {
                    equipmentId: '01234567890123456789/01234567890123456789/01234567890123456789',
                    customFrequency: PeriodicVisitFrequency.Frequency18m,
                },
            ],
            equipmentsIdsSource: RegulatoryFieldSource.USER,
            observations: [
                {
                    ...baseRegulatoryObservation,
                    pdfLocation: {
                        startX: 0,
                        startY: 1,
                        endX: 2,
                        endY: 3,
                        page: 4,
                    },
                },
                {
                    ...baseRegulatoryObservation,
                    id: highObservationId,
                    priority: ActionPriority.HIGH,
                    pdfLocation: {
                        startX: 0,
                        startY: 1,
                        endX: 2,
                        endY: 3,
                        page: 4,
                    },
                },
            ],
            visitDate: new Date('2021-01-01'),
            visitDateSource: RegulatoryFieldSource.USER,
            nextVisitDate: new Date('2021-01-02'),
            organization: elementaryOrganizationMock,
            unknownReportIdentifier: false,
            observationsCount: 2,
            highPriorityObservationsCount: 1,
        };

        const prismaReport = {
            id: expectedTemporaryRegulatoryReport.id,
            url: expectedTemporaryRegulatoryReport.url,
            name: expectedTemporaryRegulatoryReport.name,
            organization: {
                id: expectedTemporaryRegulatoryReport.organization.id,
                name: expectedTemporaryRegulatoryReport.organization.name,
                parkId: expectedTemporaryRegulatoryReport.organization.parkId,
                createdBy: expectedTemporaryRegulatoryReport.organization.createdBy,
                createdAt: expectedTemporaryRegulatoryReport.organization.createdAt,
                updatedAt: expectedTemporaryRegulatoryReport.organization.updatedAt,
            },
            organizationId: expectedTemporaryRegulatoryReport.organization.id,
            reportIdentifier: expectedTemporaryRegulatoryReport.reportIdentifier,
            obligationId: expectedTemporaryRegulatoryReport.obligationId,
            status: expectedTemporaryRegulatoryReport.status,
            organizationSource: expectedTemporaryRegulatoryReport.organizationSource,
            reportIdentifierSource: expectedTemporaryRegulatoryReport.reportIdentifierSource,
            themeId: expectedTemporaryRegulatoryReport.themeId,
            themeIdSource: expectedTemporaryRegulatoryReport.themeIdSource,
            obligationIdSource: expectedTemporaryRegulatoryReport.obligationIdSource,
            buildingsIds: expectedTemporaryRegulatoryReport.buildingsIds.map(({ buildingId, customFrequency }) => ({
                temporaryRegulatoryReportId: expectedTemporaryRegulatoryReport.id,
                buildingId,
                customFrequency,
            })),
            buildingsIdsSource: expectedTemporaryRegulatoryReport.buildingsIdsSource,
            equipmentsIds: expectedTemporaryRegulatoryReport.equipmentsIds,
            equipmentsIdsSource: expectedTemporaryRegulatoryReport.equipmentsIdsSource,
            visitDate: expectedTemporaryRegulatoryReport.visitDate,
            visitDateSource: expectedTemporaryRegulatoryReport.visitDateSource,
            nextVisitDate: expectedTemporaryRegulatoryReport.nextVisitDate,
            createdBy: expectedTemporaryRegulatoryReport.createdBy,
            createdAt: expectedTemporaryRegulatoryReport.createdAt,
            updatedAt: expectedTemporaryRegulatoryReport.updatedAt,
            unknownReportIdentifier: expectedTemporaryRegulatoryReport.unknownReportIdentifier,
            userInCharge: expectedTemporaryRegulatoryReport.userInCharge,
            observations: expectedTemporaryRegulatoryReport.observations.map((observation) => ({
                id: observation.id,
                reportId: expectedTemporaryRegulatoryReport.id,
                equipmentId: observation.equipmentId,
                code: observation.code,
                observation: observation.observation,
                comment: observation.comment,
                createdAt: observation.createdAt,
                updatedAt: observation.updatedAt,
                identifiedAt: observation.identificationDate,
                pdfStartX: 0,
                pdfStartY: 1,
                pdfEndX: 2,
                pdfEndY: 3,
                pdfPage: 4,
                priority: observation.priority,
                buildingsIds: observation.buildingsIds,
                recommendation: observation.recommendation,
                isRecurrent: observation.isRecurrent,
                source: observation.source,
                prioritySource: observation.prioritySource,
            })),
            parkFirebaseKey: '01234567890123456789',
            blockageReason: null,
            comment: null,
            scanId: expectedTemporaryRegulatoryReport.scanId,
        } satisfies TemporaryRegulatoryReport & {
            observations: TemporaryRegulatoryObservation[];
            organization: Organization;
            buildingsIds: TemporaryRegulatoryReportBuilding[];
        };

        const mapped = prismaTemporaryRegulatoryReportToDomainMapper(prismaReport);

        expect(mapped).toEqual(expectedTemporaryRegulatoryReport);
    });

    it('should map ElementaryRegulatoryReport', () => {
        const mapped = prismaRegulatoryReportToElementaryDomainMapper(prismaRegulatoryReportMock);

        expect(mapped).toEqual({
            id: prismaRegulatoryReportMock.id,
            name: prismaRegulatoryReportMock.name,
            documentId: prismaRegulatoryReportMock.documentKey,
            reportIdentifier: prismaRegulatoryReportMock.code,
            createdAt: prismaRegulatoryReportMock.createdAt,
            updatedAt: prismaRegulatoryReportMock.updatedAt,
            createdBy: prismaRegulatoryReportMock.createdBy,
            archived: prismaRegulatoryReportMock.archived,
        });
    });

    it('should map RegulatoryReport', () => {
        const mapped = prismaRegulatoryReportToDomainMapper(prismaRegulatoryReportMock);

        expect(mapped).toEqual({
            id: prismaRegulatoryReportMock.id,
            name: prismaRegulatoryReportMock.name,
            documentId: prismaRegulatoryReportMock.documentKey,
            reportIdentifier: prismaRegulatoryReportMock.code,
            createdAt: prismaRegulatoryReportMock.createdAt,
            updatedAt: prismaRegulatoryReportMock.updatedAt,
            createdBy: prismaRegulatoryReportMock.createdBy,
            visitDate: prismaRegulatoryReportMock.visitDateView?.visitDate,
            themeId:
                prismaRegulatoryReportMock.periodicVisits[0].regulatoryObligation.genericRegulatoryObligation.themeKey,
            organization: undefined,
            observations: [],
            buildings: [prismaBuildingToDomainMapper(prismaVisitMock.regulatoryObligation.building)],
            equipments: [],
            genericObligations: [
                prismaGenericRegulatoryObligationToDomainMapper(
                    prismaVisitMock.regulatoryObligation.genericRegulatoryObligation
                ),
            ],
            obligations: [prismaRegulatoryObligationToElementaryDomainMapper(prismaVisitMock.regulatoryObligation)],
            periodicVisits: [
                prismaRegulatoryPeriodicVisitToElementaryDomainMapper(prismaRegulatoryReportMock.periodicVisits[0]),
            ],
            contracts: [],
            validUntil: expect.any(Date),
            archived: prismaRegulatoryReportMock.archived,
        });
    });
});
