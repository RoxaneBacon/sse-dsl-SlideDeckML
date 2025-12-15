import type { Module } from 'langium';
import {
    createDefaultCoreModule,
    createDefaultSharedCoreModule,
    inject,
    type DefaultSharedCoreModuleContext,
    type LangiumCoreServices,
    type LangiumSharedCoreServices
} from 'langium';
import { SlideDeckMLGeneratedModule, SlideDeckMLGeneratedSharedModule } from './generated/module.js';

export type SlideDeckMLAddedServices = {
    // Add custom services here if needed later
}

export type SlideDeckMLServices = LangiumCoreServices & SlideDeckMLAddedServices;

export const SlideDeckMLModule: Module<SlideDeckMLServices, SlideDeckMLAddedServices> = {
    // Custom services can be added here
};

export function createSlideDeckMLServices(context: DefaultSharedCoreModuleContext): {
    shared: LangiumSharedCoreServices,
    SlideDeckML: SlideDeckMLServices
} {
    const shared = inject(
        createDefaultSharedCoreModule(context),
        SlideDeckMLGeneratedSharedModule
    );
    const SlideDeckML = inject(
        createDefaultCoreModule({ shared }),
        SlideDeckMLGeneratedModule,
        SlideDeckMLModule
    );
    shared.ServiceRegistry.register(SlideDeckML);
    return { shared, SlideDeckML };
}
