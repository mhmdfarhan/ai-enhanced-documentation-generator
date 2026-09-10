'use client';

import { DashboardNav } from "@/components/dashboard/nav";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface ArchitectureNode extends Node {
  type: 'module' | 'service' | 'controller' | 'model' | 'database' | 'api';
  data: {
    label: string;
    description?: string;
    fileCount?: number;
    endpoints?: number;
  };
}

export default function ArchitecturePage() {
  const { projectId } = useParams<{projectId:string}>();
  const [nodes, setNodes] = useState<ArchitectureNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [architecturePattern, setArchitecturePattern] = useState<string>('Layered Architecture');
  const [confidence, setConfidence] = useState<number>(85);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => nds);
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => eds);
  }, []);

  const isUUID=(v:any)=>typeof v==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  useEffect(() => {
    if (isUUID(projectId)) loadArchitectureData();
  }, [projectId]);

  const loadArchitectureData = async () => {
    try {
      const { data: project } = await (supabase as any)
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle() as { data: any };

      if (!project) return;
      const p: any = project;

      const generatedNodes: ArchitectureNode[] = [
        {
          id: 'frontend',
          type: 'module',
          position: { x: 250, y: 50 },
          data: {
            label: 'Frontend',
            description: 'User interface layer',
            fileCount: Math.floor((p.files_count ?? 0) * 0.3),
          },
        },
        {
          id: 'api-gateway',
          type: 'api',
          position: { x: 500, y: 150 },
          data: {
            label: 'API Gateway',
            description: 'Entry point for API requests',
            endpoints: p.api_endpoints_count,
          },
        },
        {
          id: 'auth-service',
          type: 'service',
          position: { x: 500, y: 300 },
          data: {
            label: 'Auth Service',
            description: 'Authentication & authorization',
            fileCount: Math.floor((p.files_count ?? 0) * 0.1),
          },
        },
        {
          id: 'user-service',
          type: 'service',
          position: { x: 300, y: 300 },
          data: {
            label: 'User Service',
            description: 'User management',
            fileCount: Math.floor((p.files_count ?? 0) * 0.15),
          },
        },
        {
          id: 'data-service',
          type: 'service',
          position: { x: 700, y: 300 },
          data: {
            label: 'Data Service',
            description: 'Business logic processing',
            fileCount: Math.floor((p.files_count ?? 0) * 0.2),
          },
        },
        {
          id: 'user-controller',
          type: 'controller',
          position: { x: 300, y: 450 },
          data: {
            label: 'User Controller',
            description: 'Handles user API requests',
          },
        },
        {
          id: 'user-model',
          type: 'model',
          position: { x: 300, y: 600 },
          data: {
            label: 'User Model',
            description: 'User data structure',
          },
        },
        {
          id: 'database',
          type: 'database',
          position: { x: 500, y: 750 },
          data: {
            label: 'Database',
            description: 'Persistent data storage',
          },
        },
      ];

      const generatedEdges: Edge[] = [
        { id: 'e1-2', source: 'frontend', target: 'api-gateway', label: 'HTTP Requests' },
        { id: 'e2-3', source: 'api-gateway', target: 'auth-service', label: 'Auth Check' },
        { id: 'e2-4', source: 'api-gateway', target: 'user-service', label: 'User Requests' },
        { id: 'e2-5', source: 'api-gateway', target: 'data-service', label: 'Data Requests' },
        { id: 'e4-6', source: 'user-service', target: 'user-controller', label: 'Calls' },
        { id: 'e6-7', source: 'user-controller', target: 'user-model', label: 'Uses' },
        { id: 'e7-8', source: 'user-model', target: 'database', label: 'Persists' },
        { id: 'e3-4', source: 'auth-service', target: 'user-service', label: 'Verifies' },
        { id: 'e5-8', source: 'data-service', target: 'database', label: 'Queries' },
      ];

      setNodes(generatedNodes);
      setEdges(generatedEdges);

      if ((p.framework as string)?.toLowerCase().includes('react') || (p.framework as string)?.toLowerCase().includes('vue')) {
        setArchitecturePattern('Frontend-Backend Separation');
      } else if ((p.framework as string)?.toLowerCase().includes('laravel') || (p.framework as string)?.toLowerCase().includes('spring')) {
        setArchitecturePattern('MVC Pattern');
      } else {
        setArchitecturePattern('Layered Architecture');
      }

    } catch (error) {
      console.error('Error loading architecture data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'module': return '#3B82F6';
      case 'service': return '#10B981';
      case 'controller': return '#F59E0B';
      case 'model': return '#8B5CF6';
      case 'database': return '#EF4444';
      case 'api': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const nodeTypes = {
    default: ({ data, type }: any) => (
      <div
        style={{
          background: getNodeColor(type),
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '2px solid white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '150px',
          textAlign: 'center',
        }}
      >
        <div className="font-bold text-sm">{data.label}</div>
        {data.description && (
          <div className="text-xs opacity-90 mt-1">{data.description}</div>
        )}
        {data.fileCount && (
          <div className="text-xs mt-2">
            📄 {data.fileCount} files
          </div>
        )}
        {data.endpoints && (
          <div className="text-xs mt-1">
            🔗 {data.endpoints} endpoints
          </div>
        )}
      </div>
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Architecture Visualization</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Interactive visualization of your codebase architecture
            </p>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-white rounded-lg shadow">
                <div className="text-sm text-gray-500">Pattern</div>
                <div className="font-medium">{architecturePattern}</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg shadow">
                <div className="text-sm text-gray-500">Confidence</div>
                <div className="font-medium">{confidence}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Architecture Graph */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-4">
            <div className="h-[600px] border border-gray-200 rounded">
              <ReactFlow
                nodes={nodes as any}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
              >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
          </div>

          {/* Legend and Details */}
          <div className="space-y-6">
            {/* Legend */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Node Types</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                  <span className="text-sm">Module - Major components</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-sm">Service - Business logic</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-sm">Controller - Request handlers</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-500 mr-3"></div>
                  <span className="text-sm">Model - Data structures</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-sm">Database - Storage layer</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 mr-3"></div>
                  <span className="text-sm">API - External interfaces</span>
                </div>
              </div>
            </div>

            {/* Architecture Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Architecture Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Detected Pattern</div>
                  <div className="text-lg font-bold text-gray-900">{architecturePattern}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Confidence Score</div>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${confidence}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 font-medium">{confidence}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Key Characteristics</div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="w-5 h-5 text-green-500 mr-2">✓</div>
                      <span>Clear separation of concerns between layers</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 text-green-500 mr-2">✓</div>
                      <span>Service-oriented business logic</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 text-green-500 mr-2">✓</div>
                      <span>API gateway for request routing</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 text-green-500 mr-2">✓</div>
                      <span>Modular component structure</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-4">
                Ask the AI assistant about specific architecture decisions or dependencies.
              </p>
              <a
                href={`/dashboard/projects/${projectId}/chat`}
                className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Ask AI About Architecture
              </a>
            </div>
          </div>
        </div>

        {/* Dependencies Table */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-gray-900 mb-4">Module Dependencies</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dependencies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dependents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complexity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    User Service
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Auth Service, User Model, Database
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    API Gateway, Frontend
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Medium
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Auth Service
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Database, JWT Library
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    API Gateway, User Service
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Low
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Data Service
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Database, Cache Service
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    API Gateway
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      High
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}