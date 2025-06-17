import { useCapability, usePlugin } from '@embedpdf/core/react';
import { LoaderPlugin } from '@embedpdf/plugin-loader';

export const useLoaderPlugin = () => usePlugin<LoaderPlugin>(LoaderPlugin.id);
export const useLoaderCapability = () => useCapability<LoaderPlugin>(LoaderPlugin.id);
