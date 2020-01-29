import React, { PropsWithChildren, ReactElement, ReactNode, useCallback, useRef } from 'react';
import { useBinding } from 'use-binding';
import { TreeContentContext } from 'use-tree-content';
import { noopUpdateState, TreeController, TreeControllerContext, treeControllerFromUpdateState } from 'use-tree-controller';
import { Tree, TreeSource, TreeState } from './types';
import { TreeLoaderOptions, useTreeLoader } from './use-tree-loader';

interface TreeContainerProps<T> {
    source: TreeSource<T>;
    defaultState?: TreeState;
    state?: TreeState;
    onStateChange?: (st: TreeState) => void;
    rootElement?: React.FC<{ tree: Tree<T> }>;
    render?: (props: { tree: Tree<T> }) => ReactNode;
    loaderOptions?: TreeLoaderOptions;
}

export function TreeContainer<T>(props: PropsWithChildren<TreeContainerProps<T>>, context?: any): ReactElement | null {
    const { source, defaultState, state, onStateChange, rootElement, render, children, loaderOptions } = props;
    const controller = useRef<TreeController<unknown>>(treeControllerFromUpdateState(noopUpdateState));
    const [innerState, setInnerState] = useBinding(defaultState, state, onStateChange, {});

    const tree = useTreeLoader(source, innerState, loaderOptions);

    controller.current.updateState = useCallback((updater) => {
        setInnerState(updater(innerState, tree));
    }, [innerState, setInnerState, tree]);

    return (
        <TreeContentContext.Provider value={tree}>
            <TreeControllerContext.Provider value={controller.current}>
                {rootElement && React.createElement(rootElement, { tree })}
                {render && render({ tree })}
                {children}
            </TreeControllerContext.Provider>
        </TreeContentContext.Provider>
    );
}
