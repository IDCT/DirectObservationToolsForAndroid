/*******************************************************************************
 * Copyright (c) 2010-2012, GEM Foundation.
 * IDCT Android is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * IDCT Android is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with IDCT Android.  If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/
package com.idctdo.android;


import android.app.Activity;
import android.app.TabActivity;
import android.os.Bundle;

import java.util.ArrayList;
import java.util.UUID;

import android.app.Activity;
import android.database.Cursor;
import android.database.DatabaseUtils;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.Spinner;
import android.widget.TabHost;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.Toast;


public class Floor_Selection_Form extends Activity {

	public boolean DEBUG_LOG = false; 


	public TabActivity tabActivity;
	public TabHost tabHost;
	public int tabIndex = 5;

	private String topLevelAttributeDictionary = "DIC_FLOOR_MATERIAL";
	private String topLevelAttributeKey = "FLOOR_MAT";
	
	private String secondLevelAttributeDictionary = "DIC_FLOOR_TYPE";
	private String secondLevelAttributeKey = "FLOOR_TYPE";
		
	private String foundationSystemAttributeDictionary = "DIC_FOUNDATION_SYSTEM";
	private String foundationSystemAttributeKey = "FOUNDN_SYS";
	

	public Spinner spinnerFoundationSystem;
	
	private SelectedAdapter selectedAdapter;
	private SelectedAdapter selectedAdapter2;

	
	private ArrayList list;
	public ArrayList<DBRecord> secondLevelAttributesList;


	ListView listview;
	ListView listview2;		 

	public GemDbAdapter mDbHelper;
	public GEMSurveyObject surveyDataObject;
	

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.floor_selectable_list);


	}

	@Override
	protected void onResume() {
		super.onResume();
		MainTabActivity a = (MainTabActivity)getParent();
		surveyDataObject = (GEMSurveyObject)getApplication();

		
		
		
		if (a.isTabCompleted(tabIndex)) {

		} else {
			mDbHelper = new GemDbAdapter(getBaseContext());        

			mDbHelper.createDatabase();      
			mDbHelper.open();

			
			
			spinnerFoundationSystem = (Spinner)  findViewById(R.id.spinnerFoundationSystem);
			final Cursor foundationSystemAttributeDictionaryCursor = mDbHelper.getAttributeValuesByDictionaryTable(foundationSystemAttributeDictionary);
			ArrayList<DBRecord> foundationSystemAttributesList = GemUtilities.cursorToArrayList(foundationSystemAttributeDictionaryCursor);
			ArrayAdapter spinnerArrayAdapter2 = new ArrayAdapter(this,android.R.layout.simple_spinner_item,foundationSystemAttributesList );
			spinnerArrayAdapter2.setDropDownViewResource(R.layout.simple_spinner_item);
			spinnerFoundationSystem.setAdapter(spinnerArrayAdapter2);						
			
			spinnerFoundationSystem.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
				public void onItemSelected(AdapterView<?> parent, View view, int pos, long id) {
					//Object item = parent.getItemAtPosition(pos);
					Log.d("IDCT","spinner selected: " + spinnerFoundationSystem.getSelectedItem().toString());
					Log.d("IDCT","spinner selected pos: " + pos);
					
					//Temporarily disabled 7/1/13					
					//allAttributeTypesTopLevelCursor.moveToPosition(pos);							
					//surveyDataObject.putGedData(topLevelAttributeKey,  allAttributeTypesTopLevelCursor.getString(1).toString());
					DBRecord selected = (DBRecord) spinnerFoundationSystem.getSelectedItem();
					Log.d("IDCT","SELECTED: " + selected.getAttributeValue());
					surveyDataObject.putGedData(foundationSystemAttributeKey, selected.getAttributeValue());		
				}
				public void onNothingSelected(AdapterView<?> parent) {
				}
			});	
			
			
			
			Cursor allAttributeTypesTopLevelCursor = mDbHelper.getAttributeValuesByDictionaryTable(topLevelAttributeDictionary);     
			ArrayList<DBRecord> topLevelAttributesList = GemUtilities.cursorToArrayList(allAttributeTypesTopLevelCursor);        
			if (DEBUG_LOG) Log.d("IDCT","TYPES: " + topLevelAttributesList.toString());
			allAttributeTypesTopLevelCursor.close();

			Cursor allAttributeTypesSecondLevelCursor = mDbHelper.getAttributeValuesByDictionaryTableAndScope(secondLevelAttributeDictionary,"X");
			secondLevelAttributesList = GemUtilities.cursorToArrayList(allAttributeTypesSecondLevelCursor);
			allAttributeTypesSecondLevelCursor.close();
			
			mDbHelper.close();

			selectedAdapter = new SelectedAdapter(this,0,topLevelAttributesList);
			selectedAdapter.setNotifyOnChange(true);

			listview = (ListView) findViewById(R.id.listExample);
			listview.setAdapter(selectedAdapter);        


			selectedAdapter2 = new SelectedAdapter(this,0,secondLevelAttributesList);    		
			selectedAdapter2.setNotifyOnChange(true);		
			listview2 = (ListView) findViewById(R.id.listExample2);
			listview2.setAdapter(selectedAdapter2);        


			listview2.setVisibility(View.INVISIBLE);
			RelativeLayout relativeLayout = (RelativeLayout) findViewById(R.id.rel2);
			relativeLayout.setVisibility(View.INVISIBLE);



			listview.setOnItemClickListener(new OnItemClickListener() {
				@Override
				public void onItemClick(AdapterView arg0, View view,
						int position, long id) {
					// user clicked a list item, make it "selected"
					selectedAdapter.setSelectedPosition(position);
					selectedAdapter2.setSelectedPosition(-1);				
					surveyDataObject.putData(topLevelAttributeKey, selectedAdapter.getItem(position).getAttributeValue());
					//Toast.makeText(getApplicationContext(), "Item clicked: " + selectedAdapter.getItem(position).getOrderName() + " " + selectedAdapter.getItem(position).getOrderStatus() + " " +selectedAdapter.getItem(position).getJson(), Toast.LENGTH_SHORT).show();
					secondLevelAttributesList.clear();				

					
					mDbHelper.open();				
					//Cursor mCursor = mDbHelper.getAllMaterialTechnologies(selectedAdapter.getItem(position).getJson());
					Cursor mCursor = mDbHelper.getAttributeValuesByDictionaryTableAndScope(secondLevelAttributeDictionary,selectedAdapter.getItem(position).getJson());
					mCursor.moveToFirst();
					while(!mCursor.isAfterLast()) {
						//mArrayList.add(mCursor.getString(mCursor.getColumnIndex(mCursor.getColumnName(1))));

						DBRecord o1 = new DBRecord();	
						if (DEBUG_LOG) Log.d("IDCT", "CURSOR TO ARRAY LIST" + mCursor.getString(mCursor.getColumnIndex(mCursor.getColumnName(1))));
						//String mTitleRaw = mCursor.getString(mCursor.getColumnIndex(mCursor.getColumnName(1)));
						o1.setAttributeDescription(mCursor.getString(0));
						o1.setAttributeValue(mCursor.getString(1));
						o1.setJson(mCursor.getString(2));
						secondLevelAttributesList.add(o1);
						mCursor.moveToNext();
					}
				
					mDbHelper.close();    		  				

					if (mCursor.getCount() > 0) { 
						listview2.setVisibility(View.VISIBLE);
						RelativeLayout relativeLayout = (RelativeLayout) findViewById(R.id.rel2);
						relativeLayout.setVisibility(View.VISIBLE);
					}
					mCursor.close();
					
					selectedAdapter2.notifyDataSetChanged();       

					completeThis();


				}
			});        

			listview2.setOnItemClickListener(new OnItemClickListener() {
				@Override
				public void onItemClick(AdapterView arg0, View view,int position, long id) {
					// user clicked a list item, make it "selected" 		        
					selectedAdapter2.setSelectedPosition(position);		
					surveyDataObject.putData(secondLevelAttributeKey, selectedAdapter2.getItem(position).getAttributeValue());
					
					//Toast.makeText(getApplicationContext(), "LV2 click: " + selectedAdapter2.getItem(position).getOrderName() + " " + selectedAdapter2.getItem(position).getOrderStatus() + " " +selectedAdapter2.getItem(position).getJson(), Toast.LENGTH_SHORT).show();


				}
			});

		}		
	}

	public void clearThis() {
		if (DEBUG_LOG) Log.d("IDCT", "clearing stuff");
		selectedAdapter.setSelectedPosition(-1);
		selectedAdapter2.setSelectedPosition(-1);
	}

	@Override
	public void onBackPressed() {
		if (DEBUG_LOG) Log.d("IDCT","back button pressed");
		MainTabActivity a = (MainTabActivity)getParent();
		a.backButtonPressed();
	}

	public void completeThis() {
		MainTabActivity a = (MainTabActivity)getParent();
		a.completeTab(tabIndex);
	}

}
